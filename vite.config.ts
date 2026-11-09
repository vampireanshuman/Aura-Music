import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import { Ytdl, chooseFormat } from '@distube/ytdl-core'

const ytdl = new Ytdl();
const infoCache = new Map<string, { info: any; timestamp: number }>();

function youtubeMusicApiPlugin(): Plugin {
  return {
    name: 'youtube-music-api',
    configureServer(server) {
      // 0. High-Performance Audio Stream Proxy via @distube/ytdl-core
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/stream')) {
          return next();
        }

        if (req.method === 'OPTIONS') {
          res.statusCode = 204;
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Range, Content-Type, Accept');
          res.setHeader('Access-Control-Expose-Headers', 'Content-Range, Content-Length, Accept-Ranges');
          res.end();
          return;
        }

        try {
          const urlObj = new URL(req.url, 'http://localhost:5173');
          const videoId = urlObj.searchParams.get('id');

          if (!videoId) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Missing id parameter' }));
            return;
          }

          let info: any = null;
          const cached = infoCache.get(videoId);
          if (cached && Date.now() - cached.timestamp < 3600000) {
            info = cached.info;
          } else {
            info = await ytdl.getInfo(videoId);
            infoCache.set(videoId, { info, timestamp: Date.now() });
          }

          let chosenFormat: any = null;
          try {
            chosenFormat = chooseFormat(info.formats, {
              filter: (f: any) => f.hasAudio && !f.hasVideo && (f.container === 'm4a' || f.container === 'mp4'),
              quality: 'highestaudio'
            });
          } catch {
            chosenFormat = chooseFormat(info.formats, {
              filter: { hasAudio: true, hasVideo: false },
              quality: 'highestaudio'
            });
          }

          if (!chosenFormat) {
            res.statusCode = 404;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'No audio format available' }));
            return;
          }

          const total = chosenFormat.contentLength ? Number(chosenFormat.contentLength) : 0;
          const mime = chosenFormat.mimeType ? chosenFormat.mimeType.split(';')[0] : 'audio/mp4';

          const rangeHeader = req.headers['range'];
          let rangeOpt: { start?: number; end?: number } | undefined = undefined;

          res.setHeader('Content-Type', mime);
          res.setHeader('Accept-Ranges', 'bytes');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Range, Content-Type, Accept');
          res.setHeader('Access-Control-Expose-Headers', 'Content-Range, Content-Length, Accept-Ranges');

          if (rangeHeader && total > 0) {
            const parts = rangeHeader.replace(/bytes=/, '').split('-');
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : total - 1;

            if (!isNaN(start)) {
              const finalEnd = !isNaN(end) ? end : total - 1;
              rangeOpt = { start, end: finalEnd };
              res.statusCode = 206;
              res.setHeader('Content-Range', `bytes ${start}-${finalEnd}/${total}`);
              res.setHeader('Content-Length', (finalEnd - start + 1).toString());
            } else {
              res.statusCode = 200;
              res.setHeader('Content-Length', total.toString());
            }
          } else {
            res.statusCode = 200;
            if (total > 0) {
              res.setHeader('Content-Length', total.toString());
            }
          }

          const stream = ytdl.download(videoId, {
            format: chosenFormat,
            ...(rangeOpt ? { range: rangeOpt } : {})
          });

          req.on('close', () => {
            stream.destroy();
          });

          stream.on('error', (err) => {
            console.error('ytdl stream error:', err.message);
            if (!res.headersSent) {
              res.statusCode = 500;
              res.end();
            }
          });

          stream.pipe(res);
        } catch (err: any) {
          console.error('Stream handler error:', err);
          if (!res.headersSent) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message }));
          }
        }
      });

      // 0.5 High-Definition Video Stream Proxy via @distube/ytdl-core
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/video-stream')) {
          return next();
        }

        if (req.method === 'OPTIONS') {
          res.statusCode = 204;
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Range, Content-Type, Accept');
          res.setHeader('Access-Control-Expose-Headers', 'Content-Range, Content-Length, Accept-Ranges');
          res.end();
          return;
        }

        try {
          const urlObj = new URL(req.url, 'http://localhost:5173');
          const videoId = urlObj.searchParams.get('id');
          const qualityPref = urlObj.searchParams.get('quality') || '720p';

          if (!videoId) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Missing id parameter' }));
            return;
          }

          let info: any = null;
          const cached = infoCache.get(videoId);
          if (cached && Date.now() - cached.timestamp < 3600000) {
            info = cached.info;
          } else {
            info = await ytdl.getInfo(videoId);
            infoCache.set(videoId, { info, timestamp: Date.now() });
          }

          const videoFormats = info.formats.filter((f: any) => f.hasVideo && (f.container === 'mp4' || f.container === 'webm'));
          
          // Universally hardware-accelerated H.264 / AVC1 MP4 formats for zero mobile decode errors
          const avcFormats = info.formats.filter((f: any) => f.hasVideo && f.container === 'mp4' && f.mimeType?.includes('avc1'));
          
          let chosenFormat = avcFormats.find((f: any) => f.qualityLabel?.includes(qualityPref));
          if (!chosenFormat) {
            chosenFormat = avcFormats.find((f: any) => f.qualityLabel?.includes('720p') || f.qualityLabel?.includes('480p') || f.qualityLabel?.includes('1080p') || f.qualityLabel?.includes('360p'));
          }
          if (!chosenFormat) {
            chosenFormat = videoFormats.find((f: any) => f.container === 'mp4');
          }
          if (!chosenFormat) {
            chosenFormat = videoFormats[0];
          }

          if (!chosenFormat) {
            res.statusCode = 404;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'No video format available' }));
            return;
          }

          const total = chosenFormat.contentLength ? Number(chosenFormat.contentLength) : 0;
          const mime = chosenFormat.mimeType ? chosenFormat.mimeType.split(';')[0] : 'video/mp4';

          const rangeHeader = req.headers['range'];
          let rangeOpt: { start?: number; end?: number } | undefined = undefined;

          res.setHeader('Content-Type', mime);
          res.setHeader('Accept-Ranges', 'bytes');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Range, Content-Type, Accept');
          res.setHeader('Access-Control-Expose-Headers', 'Content-Range, Content-Length, Accept-Ranges');

          if (rangeHeader && total > 0) {
            const parts = rangeHeader.replace(/bytes=/, '').split('-');
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : total - 1;

            if (!isNaN(start)) {
              const finalEnd = !isNaN(end) ? end : total - 1;
              rangeOpt = { start, end: finalEnd };
              res.statusCode = 206;
              res.setHeader('Content-Range', `bytes ${start}-${finalEnd}/${total}`);
              res.setHeader('Content-Length', (finalEnd - start + 1).toString());
            } else {
              res.statusCode = 200;
              res.setHeader('Content-Length', total.toString());
            }
          } else {
            res.statusCode = 200;
            if (total > 0) {
              res.setHeader('Content-Length', total.toString());
            }
          }

          const stream = ytdl.download(videoId, {
            format: chosenFormat,
            ...(rangeOpt ? { range: rangeOpt } : {})
          });

          req.on('close', () => {
            stream.destroy();
          });

          stream.on('error', (err) => {
            console.error('ytdl video stream error:', err.message);
            if (!res.headersSent) {
              res.statusCode = 500;
              res.end();
            }
          });

          stream.pipe(res);
        } catch (err: any) {
          console.error('Video stream handler error:', err);
          if (!res.headersSent) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message }));
          }
        }
      });

      // 0.6 Video Info API
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/video-info')) {
          return next();
        }

        try {
          const urlObj = new URL(req.url, 'http://localhost:5173');
          const videoId = urlObj.searchParams.get('id');

          if (!videoId) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Missing id parameter' }));
            return;
          }

          let info: any = null;
          const cached = infoCache.get(videoId);
          if (cached && Date.now() - cached.timestamp < 3600000) {
            info = cached.info;
          } else {
            info = await ytdl.getInfo(videoId);
            infoCache.set(videoId, { info, timestamp: Date.now() });
          }

          const videoFormats = info.formats
            .filter((f: any) => f.hasVideo)
            .map((f: any) => ({
              itag: f.itag,
              quality: f.qualityLabel,
              container: f.container,
              contentLength: f.contentLength,
              mimeType: f.mimeType
            }));

          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.end(JSON.stringify({
            videoId,
            title: info.videoDetails?.title || '',
            author: info.videoDetails?.author?.name || '',
            duration: parseInt(info.videoDetails?.lengthSeconds || '0', 10),
            thumbnail: info.videoDetails?.thumbnails?.slice(-1)[0]?.url || '',
            streamUrl: `/api/video-stream?id=${videoId}`,
            formats: videoFormats
          }));
        } catch (err: any) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: err.message }));
        }
      });

      // 0.7 LRCLIB Server-Side Lyrics Proxy with Smart Title Cleaning
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/lyrics')) {
          return next();
        }

        try {
          const urlObj = new URL(req.url, 'http://localhost:5173');
          const rawTrack = urlObj.searchParams.get('track') || '';
          const rawArtist = urlObj.searchParams.get('artist') || '';

          if (!rawTrack.trim()) {
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.end(Buffer.from(JSON.stringify({ ok: false, lyrics: [] }), 'utf-8'));
            return;
          }

          let cleanTrack = rawTrack;
          let cleanArtist = rawArtist || '';

          // 1. Cut off pipe suffixes e.g. "| Ae Dil Hai Mushkil | Ranbir Kapoor"
          if (cleanTrack.includes('|')) {
            cleanTrack = cleanTrack.split('|')[0];
          }

          // 2. Remove all parentheticals and brackets e.g. (From "Brahmastra"), (feat. XYZ), (Tu Fuljhadiyo...)
          cleanTrack = cleanTrack.replace(/\s*[\(\[][^\)\]]*[\)\]]/g, '');

          // 3. Separate "Artist - Track" or "Track - Subtitle"
          if (cleanTrack.includes(' - ')) {
            const parts = cleanTrack.split(' - ');
            const first = parts[0].trim();
            const second = parts.slice(1).join(' - ').trim();
            if (!cleanArtist || first.toLowerCase().includes(cleanArtist.toLowerCase()) || cleanArtist.toLowerCase().includes(first.toLowerCase())) {
              cleanTrack = second;
              cleanArtist = first;
            } else {
              cleanTrack = first;
            }
          }

          // 4. Strip leftover artifacts
          cleanTrack = cleanTrack.replace(/\s*-\s*(?:single|ep|album|remastered|official|full\s*song|video\s*song|audio\s*song|lyrical|visualizer).*$/gi, '');
          cleanTrack = cleanTrack.replace(/^[\s\-_:•]+|[\s\-_:•]+$/g, '').trim();

          // Clean artist name: strip view counts, Topic, VEVO, Official
          cleanArtist = cleanArtist
            .replace(/\s*\d+(\.\d+)?\s*[MKmk]?\s*views.*$/i, '')
            .replace(/\s*-\s*Topic$/i, '')
            .replace(/\s*VEVO$/i, '')
            .replace(/\s*Official$/i, '')
            .replace(/^[\s\-_:•]+|[\s\-_:•]+$/g, '')
            .trim();

          const userAgent = 'AuraMusic/3.2 (https://github.com/lastwave)';

          let foundLrc: string | null = null;
          let isSynced = false;

          // Attempt 1: Exact /api/get
          const exactUrl = `https://lrclib.net/api/get?track_name=${encodeURIComponent(cleanTrack)}&artist_name=${encodeURIComponent(cleanArtist)}`;
          const exactRes = await fetch(exactUrl, { headers: { 'User-Agent': userAgent } }).catch(() => null);
          if (exactRes && exactRes.ok) {
            const data: any = await exactRes.json().catch(() => null);
            if (data?.syncedLyrics) {
              foundLrc = data.syncedLyrics;
              isSynced = true;
            } else if (data?.plainLyrics) {
              foundLrc = data.plainLyrics;
            }
          }

          // Attempt 2: Search with artist + track
          if (!foundLrc) {
            const searchUrl = `https://lrclib.net/api/search?q=${encodeURIComponent((cleanArtist + ' ' + cleanTrack).trim())}`;
            const searchRes = await fetch(searchUrl, { headers: { 'User-Agent': userAgent } }).catch(() => null);
            if (searchRes && searchRes.ok) {
              const list: any = await searchRes.json().catch(() => []);
              if (Array.isArray(list) && list.length > 0) {
                const syncedHit = list.find((item: any) => item.syncedLyrics);
                if (syncedHit?.syncedLyrics) {
                  foundLrc = syncedHit.syncedLyrics;
                  isSynced = true;
                } else if (list[0]?.plainLyrics) {
                  foundLrc = list[0].plainLyrics;
                }
              }
            }
          }

          // Attempt 3: Track name search alone
          if (!foundLrc && cleanTrack.length > 2) {
            const searchUrl = `https://lrclib.net/api/search?q=${encodeURIComponent(cleanTrack)}`;
            const searchRes = await fetch(searchUrl, { headers: { 'User-Agent': userAgent } }).catch(() => null);
            if (searchRes && searchRes.ok) {
              const list: any = await searchRes.json().catch(() => []);
              if (Array.isArray(list) && list.length > 0) {
                const syncedHit = list.find((item: any) => item.syncedLyrics);
                if (syncedHit?.syncedLyrics) {
                  foundLrc = syncedHit.syncedLyrics;
                  isSynced = true;
                }
              }
            }
          }

          if (!foundLrc) {
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.end(Buffer.from(JSON.stringify({ ok: false, lyrics: [] }), 'utf-8'));
            return;
          }

          const timeRegex = /\[(\d{2}):(\d{2})\.?(\d{2,3})?\]/;
          const creditRegex = /^(?:written|composed|produced|arranged|performed|provided|licensed|courtesy|synced|lyrics\s*by|music\s*by|words\s*by|composer|lyricist|producer|transcribed|lrc\s*maker|lrclib|musixmatch|spotify|apple\s*music)\b/i;
          const tagRegex = /^\[(?:ar|ti|al|au|by|offset|length|re|ve|#)\s*:[^\]]*\]$/i;

          let parsedLyrics: { time: number; text: string }[] = [];

          if (isSynced) {
            for (const line of foundLrc.split('\n')) {
              const match = timeRegex.exec(line);
              if (match) {
                const minutes = parseInt(match[1], 10);
                const seconds = parseInt(match[2], 10);
                const millis = match[3] ? parseInt(match[3].padEnd(3, '0').slice(0, 3), 10) : 0;
                const totalSeconds = minutes * 60 + seconds + millis / 1000;
                const text = line.replace(/\[\d{2}:\d{2}\.?\d{2,3}?\]/g, '').trim();

                if (text && !creditRegex.test(text) && !tagRegex.test(text)) {
                  parsedLyrics.push({
                    time: Math.round(totalSeconds * 100) / 100,
                    text
                  });
                }
              }
            }
          } else {
            const rawLines = foundLrc.split('\n').map((l: string) => l.trim()).filter((l: string) => l.length > 0 && !creditRegex.test(l) && !tagRegex.test(l));
            parsedLyrics = rawLines.map((text: string, idx: number) => ({
              time: idx * 4,
              text
            }));
          }

          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.end(Buffer.from(JSON.stringify({
            ok: true,
            synced: isSynced,
            lyrics: parsedLyrics
          }), 'utf-8'));
        } catch (err: any) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.end(Buffer.from(JSON.stringify({ ok: false, error: err.message, lyrics: [] }), 'utf-8'));
        }
      });

      // 1. YouTube Music Instant Search API
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/search')) {
          return next();
        }

        try {
          const urlObj = new URL(req.url, 'http://localhost:5173');
          const query = urlObj.searchParams.get('q') || '';
          const region = urlObj.searchParams.get('region') || 'GLOBAL';
          const glCode = region === 'GLOBAL' ? 'US' : region;

          if (!query.trim()) {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ tracks: [] }));
            return;
          }

          // Call YouTube Music InnerTube API (WEB_REMIX client)
          const ytRes = await fetch('https://music.youtube.com/youtubei/v1/search', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            body: JSON.stringify({
              context: {
                client: {
                  clientName: 'WEB_REMIX',
                  clientVersion: '1.20240101.01.00',
                  hl: 'en',
                  gl: glCode
                }
              },
              query: query.trim()
            })
          });

          if (!ytRes.ok) {
            throw new Error(`InnerTube returned HTTP ${ytRes.status}`);
          }

          const data = await ytRes.json() as any;
          const sections = data.contents?.tabbedSearchResultsRenderer?.tabs?.[0]?.tabRenderer?.content?.sectionListRenderer?.contents || [];
          
          const tracks: any[] = [];
          const seenVideoIds = new Set<string>();

          for (const s of sections) {
            const list = s.itemSectionRenderer?.contents || 
                         s.musicCardShelfRenderer?.contents || 
                         (s.musicShelfRenderer ? s.musicShelfRenderer.contents : []);

            for (const item of list) {
              const r = item.musicResponsiveListItemRenderer;
              if (!r) continue;

              const flex = r.flexColumns || [];
              const title = flex[0]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs?.[0]?.text;
              const runs = flex[1]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs || [];
              const subtitle = runs.map((x: any) => x.text).join('');

              const videoId = r.overlay?.musicItemThumbnailOverlayRenderer?.content?.musicPlayButtonRenderer?.playNavigationEndpoint?.watchEndpoint?.videoId ||
                              r.navigationEndpoint?.watchEndpoint?.videoId ||
                              flex[0]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs?.[0]?.navigationEndpoint?.watchEndpoint?.videoId;

              if (!title || !videoId || seenVideoIds.has(videoId)) continue;
              seenVideoIds.add(videoId);

              const thumb = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;

              const parts = subtitle.split('•').map((p: string) => p.trim());
              let artist = 'Various Artists';
              let album = 'Single';

              if (runs.length >= 3 && (runs[0]?.text === 'Song' || runs[0]?.text === 'Video')) {
                artist = runs.slice(2).filter((x: any) => x.text !== ' • ').map((x: any) => x.text).join('') || parts[1] || 'Unknown Artist';
              } else if (parts.length > 1) {
                artist = parts[1];
                if (parts.length > 2) album = parts[2];
              }

              let duration = 210;
              const durRun = runs[runs.length - 1]?.text;
              if (durRun && durRun.includes(':')) {
                const [min, sec] = durRun.split(':').map(Number);
                if (!isNaN(min) && !isNaN(sec)) duration = min * 60 + sec;
              }

              tracks.push({
                id: `yt-${videoId}`,
                title,
                artist,
                album: album || 'YouTube Music',
                duration,
                coverUrl: thumb,
                audioUrl: `/api/stream?id=${videoId}`,
                youtubeId: videoId,
                source: 'youtube',
                dominantColor: '#fa2d48',
                genre: runs[0]?.text === 'Song' ? 'Studio Master' : 'Music Video',
                year: 2026,
                lyrics: []
              });

              if (tracks.length >= 25) break;
            }
            if (tracks.length >= 25) break;
          }

          // Sort so official Studio Master tracks always appear at the top
          tracks.sort((a, b) => {
            if (a.genre === 'Studio Master' && b.genre !== 'Studio Master') return -1;
            if (b.genre === 'Studio Master' && a.genre !== 'Studio Master') return 1;
            return 0;
          });

          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.end(JSON.stringify({ tracks }));
        } catch (err: any) {
          console.error('YouTube search middleware error:', err);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: err.message, tracks: [] }));
        }
      });

      // 2. Resolve YouTube / Spotify URL into real playable track
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/resolve')) {
          return next();
        }

        try {
          const urlObj = new URL(req.url, 'http://localhost:5173');
          const targetUrl = urlObj.searchParams.get('url') || '';

          if (!targetUrl.trim()) {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Missing url parameter' }));
            return;
          }

          let videoId = '';
          let title = '';
          let artist = '';
          let coverUrl = '';

          const ytMatch = targetUrl.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
          if (ytMatch) {
            videoId = ytMatch[1];
            try {
              const oeRes = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
              if (oeRes.ok) {
                const oe = await oeRes.json() as any;
                title = oe.title || 'YouTube Audio';
                artist = oe.author_name || 'YouTube Creator';
                coverUrl = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
              }
            } catch {
              title = 'YouTube Audio';
              artist = 'YouTube';
              coverUrl = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
            }
          } else if (targetUrl.includes('spotify.com')) {
            try {
              const spRes = await fetch(`https://open.spotify.com/oembed?url=${encodeURIComponent(targetUrl)}`);
              if (spRes.ok) {
                const sp = await spRes.json() as any;
                title = sp.title || 'Spotify Track';
                coverUrl = sp.thumbnail_url || '';
                const host = req.headers.host || '127.0.0.1:5173';
                const searchRes = await fetch(`http://${host}/api/search?q=${encodeURIComponent(title)}`);
                if (searchRes.ok) {
                  const sData = await searchRes.json() as any;
                  if (sData.tracks && sData.tracks.length > 0) {
                    const top = sData.tracks[0];
                    videoId = top.youtubeId;
                    artist = top.artist || sp.author_name || 'Spotify Artist';
                    if (!coverUrl) coverUrl = top.coverUrl;
                  }
                }
              }
            } catch (spErr) {
              console.warn('Spotify resolve error:', spErr);
            }
          }

          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.end(JSON.stringify({
            track: videoId ? {
              id: `yt-${videoId}`,
              title: title || 'Streaming Audio',
              artist: artist || 'Unknown Artist',
              album: 'Online Stream',
              duration: 210,
              coverUrl: coverUrl || `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
              audioUrl: `/api/stream?id=${videoId}`,
              youtubeId: videoId,
              source: 'youtube',
              dominantColor: '#fa2d48',
              genre: 'Stream'
            } : null
          }));
        } catch (err: any) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: err.message }));
        }
      });
    }
  };
}

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(
      (process.env.GITHUB_REF_NAME && process.env.GITHUB_REF_NAME.startsWith('v'))
        ? process.env.GITHUB_REF_NAME.slice(1)
        : '1.1.0'
    )
  },
  plugins: [
    tailwindcss(),
    react(),
    youtubeMusicApiPlugin(),
  ],
  server: {
    host: process.env.VITE_DEV_HOST || '0.0.0.0',
    port: parseInt(process.env.VITE_DEV_PORT || '5173', 10),
    allowedHosts: true,
  },
})
