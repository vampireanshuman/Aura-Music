import type { Track } from '../types/music';

/**
 * Returns the highest resolution (up to 4K / 1080p) master artwork for a track.
 * Uses high-efficiency WebP and maxres YouTube master streams to prevent blur and pixelation.
 */
export function get4kArtworkUrl(track?: Track | null): string {
  if (!track) {
    return 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=2000&auto=format&fit=crop&q=95';
  }

  // Extract YouTube ID if present
  let ytId = track.youtubeId;
  if (!ytId && track.id?.startsWith('yt-')) {
    ytId = track.id.replace('yt-', '');
  }
  if (!ytId && track.audioUrl?.includes('id=')) {
    try {
      const u = new URL(track.audioUrl, 'http://localhost');
      ytId = u.searchParams.get('id') || undefined;
    } catch {
      // ignore
    }
  }

  if (ytId && ytId.length === 11) {
    // maxresdefault is 1080p/4K master thumbnail from YouTube
    return `https://i.ytimg.com/vi/${ytId}/maxresdefault.jpg`;
  }

  if (track.coverUrl) {
    // If Unsplash, upgrade resolution parameters to 4K
    if (track.coverUrl.includes('images.unsplash.com')) {
      return track.coverUrl.replace(/w=\d+/, 'w=2000').replace(/q=\d+/, 'q=95');
    }
    // If standard YouTube thumbnail, upgrade to maxresdefault
    if (track.coverUrl.includes('i.ytimg.com')) {
      return track.coverUrl.replace(/hqdefault\.jpg|sddefault\.jpg|mqdefault\.jpg|default\.jpg/, 'maxresdefault.jpg');
    }
    return track.coverUrl;
  }

  return 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=2000&auto=format&fit=crop&q=95';
}

/**
 * Image onError handler to progressively fallback if a video doesn't have a maxresdefault uploaded.
 */
export function handleArtworkError(e: React.SyntheticEvent<HTMLImageElement, Event>, fallbackUrl?: string) {
  const target = e.currentTarget;
  const currentSrc = target.src;

  if (currentSrc.includes('maxresdefault.jpg')) {
    target.src = currentSrc.replace('maxresdefault.jpg', 'hq720.jpg');
  } else if (currentSrc.includes('hq720.jpg')) {
    target.src = currentSrc.replace('hq720.jpg', 'sddefault.jpg');
  } else if (currentSrc.includes('sddefault.jpg')) {
    target.src = currentSrc.replace('sddefault.jpg', 'hqdefault.jpg');
  } else if (fallbackUrl && target.src !== fallbackUrl) {
    target.src = fallbackUrl;
  } else {
    target.src = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&auto=format&fit=crop&q=85';
  }
}

/**
 * Standard Apple Music 1:1 true square styling to crop out baked-in 16:9 letterbox/pillarbox bars.
 */
export const APPLE_SQUARE_ART_CONTAINER_CLASS =
  "relative aspect-square w-[min(82vw,340px)] rounded-[22px] overflow-hidden select-none flex items-center justify-center bg-black/60";

export const APPLE_SQUARE_ART_IMG_CLASS =
  "w-full h-full object-cover object-center scale-[1.12] select-none rounded-[22px]";
