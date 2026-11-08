/**
 * Aura Music — Application Environment & API Configuration
 * 
 * Provides centralized access to runtime environment variables and endpoints.
 * All client-facing environment variables use the `VITE_` prefix.
 */

// Custom backend or streaming proxy URL (empty string defaults to same-origin /api/*)
export const API_BASE_URL: string = 
  (import.meta.env.VITE_API_BASE_URL as string | undefined) || '';

// Public LRCLIB instance for real-time synchronized karaoke lyrics
export const LRCLIB_API_URL: string = 
  (import.meta.env.VITE_LRCLIB_API_URL as string | undefined) || 'https://lrclib.net/api';

// Optional YouTube Data API v3 Key (for custom quota if direct client query is configured)
export const YOUTUBE_API_KEY: string = 
  (import.meta.env.VITE_YOUTUBE_API_KEY as string | undefined) || '';

// Optional Spotify Web API Developer credentials for extended playlist importing
export const SPOTIFY_CLIENT_ID: string = 
  (import.meta.env.VITE_SPOTIFY_CLIENT_ID as string | undefined) || '';

export const SPOTIFY_CLIENT_SECRET: string = 
  (import.meta.env.VITE_SPOTIFY_CLIENT_SECRET as string | undefined) || '';

/**
 * Returns a fully qualified API URL respecting VITE_API_BASE_URL.
 * Supports relative endpoints like `/api/search` or `api/stream`.
 */
export function getApiUrl(endpoint: string): string {
  const clean = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${clean}`;
}
