import type { Track } from '../types/music';
import { getApiUrl } from './apiConfig';
import { searchMusic } from './serverlessMusicEngine';

export function extractYouTubeId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

export function isSpotifyUrl(url: string): boolean {
  return /open\.spotify\.com\/(track|album|playlist)\/([a-zA-Z0-9]+)/.test(url);
}

/**
 * Resolves YouTube video into a real playable Track
 */
export async function resolveYouTubeTrack(url: string): Promise<Track | null> {
  const videoId = extractYouTubeId(url);
  if (!videoId) return null;

  try {
    let title = 'YouTube Audio Track';
    let artist = 'YouTube Creator';
    let thumbnail = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

    try {
      const res = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.title) title = data.title;
        if (data.author_name) artist = data.author_name;
        if (data.thumbnail_url) thumbnail = data.thumbnail_url;
      }
    } catch {
      // ignore
    }

    // Pre-resolve direct 320kbps audio stream if available
    let directAudioUrl = '';
    try {
      const matches = await searchMusic(`${title} ${artist}`);
      if (matches?.[0]?.audioUrl) {
        directAudioUrl = matches[0].audioUrl;
      }
    } catch {
      // fallback
    }

    return {
      id: `yt-${videoId}`,
      title,
      artist,
      album: 'YouTube Music Stream',
      duration: 210,
      audioUrl: directAudioUrl,
      coverUrl: thumbnail,
      dominantColor: '#ef4444',
      secondaryColor: '#f97316',
      genre: 'YouTube Music',
      source: 'youtube',
      youtubeId: videoId,
      year: 2026,
      lyrics: []
    };
  } catch (err) {
    console.error('Failed to resolve YouTube track:', err);
    return null;
  }
}

/**
 * Resolves Spotify track/album metadata and matches it to a real streaming YouTube Music audio ID!
 */
export async function resolveSpotifyTrack(url: string): Promise<Track | null> {
  if (!isSpotifyUrl(url)) return null;

  try {
    const res = await fetch(`https://open.spotify.com/oembed?url=${encodeURIComponent(url)}`);
    if (!res.ok) return null;
    const data = await res.json();

    let fullTitle = data.title || 'Spotify Track';
    let artist = 'Spotify Artist';
    let title = fullTitle;

    if (fullTitle.includes(' - Song by ')) {
      const parts = fullTitle.split(' - Song by ');
      title = parts[0].trim();
      artist = parts[1].replace(/ \| Spotify$/, '').trim();
    } else if (fullTitle.includes(' - ')) {
      const parts = fullTitle.split(' - ');
      title = parts[0].trim();
      artist = parts.slice(1).join(' - ').replace(/ \| Spotify$/, '').trim();
    }

    const coverUrl = data.thumbnail_url || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80';

    // Query serverless music engine (JioSaavn / Piped / iTunes) to match real 320kbps audio & artwork
    let matchedYoutubeId = '3_g2un5M350';
    let matchedAudioUrl = '';
    let matchedCoverUrl = coverUrl;
    let matchedDuration = 210;

    try {
      const serverlessResults = await searchMusic(`${title} ${artist}`);
      if (serverlessResults && serverlessResults.length > 0) {
        const top = serverlessResults[0];
        if (top.audioUrl) matchedAudioUrl = top.audioUrl;
        if (top.youtubeId) matchedYoutubeId = top.youtubeId;
        if (top.coverUrl) matchedCoverUrl = top.coverUrl;
        if (top.duration) matchedDuration = top.duration;
      } else {
        const searchRes = await fetch(getApiUrl(`/api/search?q=${encodeURIComponent(`${title} ${artist}`)}`));
        if (searchRes.ok) {
          const sData = await searchRes.json();
          if (sData.tracks && sData.tracks.length > 0) {
            const top = sData.tracks[0];
            if (top.audioUrl) matchedAudioUrl = top.audioUrl;
            if (top.youtubeId) matchedYoutubeId = top.youtubeId;
            if (top.coverUrl) matchedCoverUrl = top.coverUrl;
            if (top.duration) matchedDuration = top.duration;
          }
        }
      }
    } catch {
      // fallback
    }

    return {
      id: `spotify-${Date.now()}`,
      title,
      artist,
      album: 'Spotify Synced Track',
      duration: matchedDuration,
      audioUrl: matchedAudioUrl,
      youtubeId: matchedYoutubeId,
      coverUrl: matchedCoverUrl,
      dominantColor: '#1db954',
      secondaryColor: '#10b981',
      genre: 'Spotify Sync',
      source: 'spotify',
      spotifyId: url,
      year: 2026,
      lyrics: []
    };
  } catch (err) {
    console.error('Failed to resolve Spotify track:', err);
    return null;
  }
}
