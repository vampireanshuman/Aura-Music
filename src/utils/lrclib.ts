import type { LyricLine } from '../types/music';
import { getApiUrl, LRCLIB_API_URL } from './apiConfig';

// In-memory lyrics cache to prevent redundant network calls
const lyricsMemoryCache = new Map<string, LyricLine[]>();

/**
 * Strips YouTube / Streaming metadata, bracketed descriptors, and noise
 */
export function cleanTrackTitle(title: string): string {
  let cleaned = title;

  // 1. Cut off YouTube pipe chains e.g. "Title | Movie | Artist"
  if (cleaned.includes('|')) {
    cleaned = cleaned.split('|')[0];
  }

  // 2. Remove all parentheticals and brackets e.g. (From "Brahmastra"), (feat. XYZ)
  cleaned = cleaned.replace(/\s*[\(\[][^\)\]]*[\)\]]/g, '');

  // 3. Separate "Artist - Track" or "Track - Subtitle"
  if (cleaned.includes(' - ')) {
    const parts = cleaned.split(' - ');
    cleaned = parts[0].trim();
  }

  // 4. Strip leftover artifacts
  cleaned = cleaned.replace(/\s*-\s*(?:single|ep|album|remastered|official|full\s*song|video\s*song|audio\s*song|lyrical|visualizer).*$/gi, '');
  cleaned = cleaned.replace(/^[\s\-_:•]+|[\s\-_:•]+$/g, '').trim();

  return cleaned || title;
}

/**
 * Cleans artist name from view counts, topic/vevo/official suffixes
 */
export function cleanArtistName(artist: string): string {
  let cleaned = artist;
  cleaned = cleaned.replace(/\s*\d+(\.\d+)?\s*[MKmk]?\s*views.*$/i, '');
  cleaned = cleaned.replace(/\s*-\s*Topic$/i, '');
  cleaned = cleaned.replace(/\s*VEVO$/i, '');
  cleaned = cleaned.replace(/\s*Official$/i, '');
  cleaned = cleaned.replace(/,\s*Inc\.?$/i, '');
  cleaned = cleaned.replace(/^[\s\-_:•]+|[\s\-_:•]+$/g, '');
  return cleaned.trim();
}

/**
 * Checks whether a lyric line is purely metadata or credits
 * (inspired by LastWave LyricsSanitizer)
 */
function shouldSuppressLyric(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return true;

  // Credit rows & provider watermarks
  const creditRegex = /^(?:written|composed|produced|arranged|performed|provided|licensed|courtesy|synced|lyrics\s*by|music\s*by|words\s*by|composer|lyricist|producer|transcribed|lrc\s*maker|lrclib|musixmatch|spotify|apple\s*music)\b/i;
  // Label rows e.g. "作词 : ...", "Artist: ..."
  const labelRegex = /^(?:lyricists?|lyrics|composers?|music|writers?|producers?|label|credits?|source|offset|作词|作曲|编曲)\s*[:：]/i;
  // LRC header tags left inside body e.g. [ar: ...], [ti: ...]
  const tagRegex = /^\[(?:ar|ti|al|au|by|offset|length|re|ve|#)\s*:[^\]]*\]$/i;
  // Copyright footer
  const copyrightRegex = /^(?:©|\(c\)|copyright|℗|all rights reserved)/i;

  return creditRegex.test(trimmed) || labelRegex.test(trimmed) || tagRegex.test(trimmed) || copyrightRegex.test(trimmed);
}

/**
 * Parses raw LRC format lyrics into timestamped LyricLine objects
 * Supports millisecond timestamps e.g. [01:23.45] or [01:23.456]
 */
export function parseLrcString(lrcContent: string): LyricLine[] {
  const lines = lrcContent.split('\n');
  const result: LyricLine[] = [];
  const timeRegex = /\[(\d{2}):(\d{2})\.?(\d{2,3})?\]/;

  for (const line of lines) {
    const match = timeRegex.exec(line);
    if (match) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseInt(match[2], 10);
      const millis = match[3] ? parseInt(match[3].padEnd(3, '0').slice(0, 3), 10) : 0;
      const totalSeconds = minutes * 60 + seconds + millis / 1000;
      const text = line.replace(/\[\d{2}:\d{2}\.?\d{2,3}?\]/g, '').trim();

      if (text.length > 0 && !shouldSuppressLyric(text)) {
        result.push({
          time: Math.round(totalSeconds * 100) / 100,
          text
        });
      }
    }
  }

  return result.sort((a, b) => a.time - b.time);
}

interface LrclibRecord {
  id?: number;
  trackName?: string;
  artistName?: string;
  albumName?: string;
  duration?: number;
  instrumental?: boolean;
  plainLyrics?: string;
  syncedLyrics?: string;
}

/**
 * High-reliability multi-tiered lyrics retriever using LRCLIB API:
 * 1. Exact match with cleaned track & artist
 * 2. Search query with cleanTrack + cleanArtist
 * 3. Search query with cleanTrack alone
 */
export async function fetchLrclibLyrics(trackName: string, artistName: string): Promise<LyricLine[] | null> {
  if (!trackName) return null;

  // Separate "Artist - Track" if baked into trackName
  let rawTrack = trackName;
  let rawArtist = artistName || '';
  if (rawTrack.includes(' - ')) {
    const parts = rawTrack.split(' - ');
    if (parts.length >= 2) {
      const first = parts[0].trim();
      const second = parts.slice(1).join(' - ').trim();
      if (!rawArtist || first.toLowerCase().includes(rawArtist.toLowerCase()) || rawArtist.toLowerCase().includes(first.toLowerCase())) {
        rawTrack = second;
        rawArtist = first;
      }
    }
  }

  const cleanTrack = cleanTrackTitle(rawTrack);
  const cleanArtist = cleanArtistName(rawArtist);
  const cacheKey = `${cleanTrack.toLowerCase()}:::${cleanArtist.toLowerCase()}`;

  // Check in-memory cache
  if (lyricsMemoryCache.has(cacheKey)) {
    return lyricsMemoryCache.get(cacheKey)!;
  }

  // Check localStorage cache
  try {
    const cached = localStorage.getItem(`aura_lyrics_${cacheKey}`);
    if (cached) {
      const parsed: LyricLine[] = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        lyricsMemoryCache.set(cacheKey, parsed);
        return parsed;
      }
    }
  } catch {
    // Ignore storage errors
  }

  // Tier 0: Query high-performance local server proxy with automatic title cleaning and LRC parsing
  try {
    const proxyUrl = getApiUrl(`/api/lyrics?track=${encodeURIComponent(cleanTrack)}&artist=${encodeURIComponent(cleanArtist)}`);
    const proxyRes = await fetch(proxyUrl);
    if (proxyRes.ok) {
      const data = await proxyRes.json();
      if (data && data.ok && Array.isArray(data.lyrics) && data.lyrics.length > 0) {
        saveToCache(cacheKey, data.lyrics);
        return data.lyrics;
      }
    }
  } catch (proxyErr) {
    console.warn('Local lyrics proxy query failed, falling back to direct network:', proxyErr);
  }

  try {
    // Tier 1: Try exact match directly
    const exactUrl = `${LRCLIB_API_URL}/get?track_name=${encodeURIComponent(cleanTrack)}&artist_name=${encodeURIComponent(cleanArtist)}`;
    const exactRes = await fetch(exactUrl).catch(() => null);

    if (exactRes && exactRes.ok) {
      const record: LrclibRecord = await exactRes.json();
      if (record.syncedLyrics) {
        const parsed = parseLrcString(record.syncedLyrics);
        if (parsed.length > 0) {
          saveToCache(cacheKey, parsed);
          return parsed;
        }
      }
    }

    // Tier 2: Search with Artist + Track (Highest hit rate for YouTube songs)
    const searchQuery = `${cleanArtist} ${cleanTrack}`.trim();
    const searchUrl = `${LRCLIB_API_URL}/search?q=${encodeURIComponent(searchQuery)}`;
    const searchRes = await fetch(searchUrl).catch(() => null);

    if (searchRes && searchRes.ok) {
      const list: LrclibRecord[] = await searchRes.json();
      if (Array.isArray(list) && list.length > 0) {
        // Prioritize candidates with syncedLyrics
        const syncedCandidate = list.find(item => Boolean(item.syncedLyrics));
        if (syncedCandidate?.syncedLyrics) {
          const parsed = parseLrcString(syncedCandidate.syncedLyrics);
          if (parsed.length > 0) {
            saveToCache(cacheKey, parsed);
            return parsed;
          }
        }

        // Fallback to plain lyrics if synced not available
        const plainCandidate = list.find(item => Boolean(item.plainLyrics));
        if (plainCandidate?.plainLyrics) {
          const lines = plainCandidate.plainLyrics
            .split('\n')
            .map(l => l.trim())
            .filter(l => l.length > 0 && !shouldSuppressLyric(l));

          const parsed: LyricLine[] = lines.map((text, idx) => ({
            time: idx * 4,
            text
          }));

          if (parsed.length > 0) {
            saveToCache(cacheKey, parsed);
            return parsed;
          }
        }
      }
    }

    // Tier 3: Search with clean track name alone if artist query failed
    if (cleanTrack.length > 2) {
      const trackOnlyUrl = `${LRCLIB_API_URL}/search?q=${encodeURIComponent(cleanTrack)}`;
      const trackOnlyRes = await fetch(trackOnlyUrl).catch(() => null);

      if (trackOnlyRes && trackOnlyRes.ok) {
        const list: LrclibRecord[] = await trackOnlyRes.json();
        if (Array.isArray(list) && list.length > 0) {
          const candidate = list.find(item => Boolean(item.syncedLyrics));
          if (candidate?.syncedLyrics) {
            const parsed = parseLrcString(candidate.syncedLyrics);
            if (parsed.length > 0) {
              saveToCache(cacheKey, parsed);
              return parsed;
            }
          }
        }
      }
    }

    return null;
  } catch (err) {
    console.warn('LRCLIB fetch error:', err);
    return null;
  }
}

function saveToCache(key: string, lyrics: LyricLine[]) {
  lyricsMemoryCache.set(key, lyrics);
  try {
    localStorage.setItem(`aura_lyrics_${key}`, JSON.stringify(lyrics));
  } catch {
    // Ignore storage quota
  }
}
