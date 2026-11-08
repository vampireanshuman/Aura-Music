import type { Track } from '../types/music';

const NEON_PALETTES = [
  { p1: '#fa2d48', p2: '#ff758c', s1: '#4a00e0', s2: '#8e2de2', dark: '#0a0518' },
  { p1: '#8b5cf6', p2: '#ec4899', s1: '#2563eb', s2: '#06b6d4', dark: '#070a1e' },
  { p1: '#f59e0b', p2: '#ef4444', s1: '#7c3aed', s2: '#ec4899', dark: '#14080e' },
  { p1: '#06b6d4', p2: '#10b981', s1: '#3b82f6', s2: '#6366f1', dark: '#041017' },
  { p1: '#d946ef', p2: '#8b5cf6', s1: '#f43f5e', s2: '#3b82f6', dark: '#11051b' },
  { p1: '#ec4899', p2: '#f43f5e', s1: '#6366f1', s2: '#8b5cf6', dark: '#130614' },
];

/**
 * Generates a vibrant, track-seeded neon mesh gradient SVG data URI with a glowing vinyl/note emblem.
 * Never fails, loads in 0ms offline, and eliminates dull grey placeholder boxes permanently.
 */
export function getTrackPlaceholderSvg(seedText?: string, title?: string, artist?: string): string {
  const seed = (seedText || title || 'Aura Music').toLowerCase();
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const palette = NEON_PALETTES[Math.abs(hash) % NEON_PALETTES.length];
  const safeTitle = (title || seedText || 'Aura Music').slice(0, 24).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const safeArtist = (artist || 'Aura Music').slice(0, 28).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="100%" height="100%">
  <defs>
    <radialGradient id="meshGrad1" cx="30%" cy="25%" r="65%">
      <stop offset="0%" stop-color="${palette.p1}" stop-opacity="0.85" />
      <stop offset="100%" stop-color="${palette.p2}" stop-opacity="0" />
    </radialGradient>
    <radialGradient id="meshGrad2" cx="80%" cy="80%" r="70%">
      <stop offset="0%" stop-color="${palette.s1}" stop-opacity="0.9" />
      <stop offset="100%" stop-color="${palette.s2}" stop-opacity="0" />
    </radialGradient>
    <linearGradient id="vinylShine" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="rgba(255,255,255,0.22)" />
      <stop offset="50%" stop-color="rgba(255,255,255,0.02)" />
      <stop offset="100%" stop-color="rgba(255,255,255,0.18)" />
    </linearGradient>
    <filter id="auraGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="14" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Deep Obsidian Base Layer -->
  <rect width="500" height="500" fill="${palette.dark}" />

  <!-- Neon Mesh Blobs -->
  <circle cx="150" cy="140" r="220" fill="url(#meshGrad1)" filter="url(#auraGlow)" />
  <circle cx="360" cy="360" r="240" fill="url(#meshGrad2)" filter="url(#auraGlow)" />

  <!-- Glowing Centered Vinyl Record -->
  <g transform="translate(250, 220)">
    <!-- Vinyl Outer Body -->
    <circle r="130" fill="#06070a" stroke="rgba(255,255,255,0.14)" stroke-width="2" />
    
    <!-- Concentric Grooves -->
    <circle r="118" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="1.5" />
    <circle r="106" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="1" />
    <circle r="94" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="1.5" />
    <circle r="82" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="1" />
    <circle r="70" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1.5" />

    <!-- Vinyl Specular Light Cones -->
    <path d="M 0 0 L -120 -50 A 130 130 0 0 1 120 -50 Z" fill="url(#vinylShine)" />
    <path d="M 0 0 L 120 50 A 130 130 0 0 1 -120 50 Z" fill="url(#vinylShine)" />

    <!-- Center Record Label -->
    <circle r="46" fill="${palette.p1}" />
    <circle r="46" fill="url(#meshGrad2)" />
    <circle r="46" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="1.5" />

    <!-- Musical Note Emblem -->
    <path d="M-6 -14 v22 a7 7 0 1 1 -7 -7 c1.4 0 2.7.4 3.8 1.1 V -11 l18 -4 v18 a7 7 0 1 1 -7 -7 c1.4 0 2.7.4 3.8 1.1 V -16 z" fill="#ffffff" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.5))" />
    <circle r="4" fill="#06070a" />
  </g>

  <!-- Typography Card Baseline -->
  <rect x="30" y="385" width="440" height="85" rx="18" fill="rgba(6,7,12,0.65)" stroke="rgba(255,255,255,0.09)" />
  <text x="50" y="422" fill="#ffffff" font-family="-apple-system,BlinkMacSystemFont,sans-serif" font-size="20" font-weight="700" letter-spacing="-0.02em">${safeTitle}</text>
  <text x="50" y="448" fill="rgba(255,255,255,0.65)" font-family="-apple-system,BlinkMacSystemFont,sans-serif" font-size="14" font-weight="500">${safeArtist}</text>
</svg>
`.trim();

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Returns the highest resolution (up to 4K / 1080p) master artwork for a track.
 * Uses high-efficiency WebP and maxres YouTube master streams to prevent blur and pixelation.
 */
export function get4kArtworkUrl(track?: Track | null): string {
  if (!track) {
    return getTrackPlaceholderSvg('Aura Music', 'Aura Music', 'Master Audio');
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

  return getTrackPlaceholderSvg(track.id || track.title, track.title, track.artist);
}

/**
 * Image onError handler to progressively fallback if a video doesn't have a maxresdefault uploaded.
 * Seamlessly transitions to the track-seeded neon mesh SVG so grey placeholder boxes never appear.
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
    // Ultimate fallback: High-fidelity neon mesh gradient SVG
    target.src = getTrackPlaceholderSvg(target.alt, target.alt, 'Aura Music');
  }
}

/**
 * Standard Apple Music 1:1 true square styling to crop out baked-in 16:9 letterbox/pillarbox bars.
 */
export const APPLE_SQUARE_ART_CONTAINER_CLASS =
  "relative aspect-square w-[min(82vw,340px)] rounded-[22px] overflow-hidden select-none flex items-center justify-center bg-black/60";

export const APPLE_SQUARE_ART_IMG_CLASS =
  "w-full h-full object-cover object-center scale-[1.12] select-none rounded-[22px]";
