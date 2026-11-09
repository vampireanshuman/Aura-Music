import type { Track, Playlist } from '../types/music';

export const YOUTUBE_FEATURED_TRACKS: Track[] = [
  {
    id: 'yt-1',
    title: 'Lofi Hip Hop Radio - Beats to Relax/Study to',
    artist: 'Lofi Girl',
    album: 'YouTube Live Essentials',
    duration: 360,
    audioUrl: '',
    youtubeId: 'jfKfPfyJRdk',
    coverUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
    dominantColor: '#ef4444', // YouTube Red
    secondaryColor: '#f97316',
    genre: 'Lo-Fi / YouTube',
    source: 'youtube',
    year: 2026,
    plays: 8940000,
    lyrics: [
      { time: 0, text: '• • • (Lofi Girl Peaceful Study Beats) • • •' },
      { time: 15, text: 'Gentle raindrops tapping on the window sill' },
      { time: 30, text: 'The city moves fast, but the room is still' },
      { time: 50, text: 'Turning the pages of a notebook old' },
      { time: 75, text: 'Stories of warmth in the evening cold' },
      { time: 105, text: '• • • (Rhodes Piano & Vinyl Hiss) • • •' },
      { time: 140, text: 'Relax your mind, stay in the groove' }
    ]
  },
  {
    id: 'yt-2',
    title: 'Synthwave Radio - Chill Synth / Retro Beats',
    artist: 'Lofi Girl & Synthwave Boy',
    album: 'Cybernetic Dreams',
    duration: 410,
    audioUrl: '',
    youtubeId: '4xDzrJKXOOY',
    coverUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    dominantColor: '#ec4899', // Hot Pink
    secondaryColor: '#8b5cf6',
    genre: 'Synthwave / Retro',
    source: 'youtube',
    year: 2026,
    plays: 4250000,
    lyrics: [
      { time: 0, text: '• • • (Analog Synthesizer Arpeggiation) • • •' },
      { time: 20, text: 'Cruising through the grid under magenta sky' },
      { time: 40, text: 'Neon horizons passing by' },
      { time: 65, text: 'Analog waves pulsing through the wire' },
      { time: 90, text: 'Setting the retro pulse on fire' }
    ]
  },
  {
    id: 'yt-3',
    title: 'Ambient Space Journey for Deep Sleep',
    artist: 'Celestial Soundscapes',
    album: 'Cosmic Drift Vol. 1',
    duration: 480,
    audioUrl: '',
    youtubeId: 'WJ3-F02-U_g',
    coverUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
    dominantColor: '#6366f1',
    secondaryColor: '#06b6d4',
    genre: 'Ambient / Sleep',
    source: 'youtube',
    year: 2026,
    plays: 1820000,
    lyrics: [
      { time: 0, text: '• • • (Weightless Stellar Drones) • • •' },
      { time: 30, text: 'Floating beyond the orbital rings' },
      { time: 60, text: 'Peace that the silence of deep space brings' },
      { time: 120, text: '• • • (Cosmic Reverberation) • • •' }
    ]
  }
];

export const SPOTIFY_FEATURED_PLAYLISTS: Playlist[] = [
  {
    id: 'spotify-top-50',
    name: "Today's Top Hits (Spotify Sync)",
    description: 'Synced from Spotify Global Chart. The biggest hits right now.',
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
    trackIds: ['track-1', 'track-4', 'track-3'],
    source: 'spotify'
  },
  {
    id: 'spotify-chill-vibes',
    name: 'Chill Vibes & Coffee (Spotify Sync)',
    description: 'Laid-back acoustic and chill tunes curated from Spotify playlists.',
    coverUrl: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&auto=format&fit=crop&q=80',
    trackIds: ['track-3', 'track-5', 'track-2'],
    source: 'spotify'
  },
  {
    id: 'spotify-synth-vault',
    name: 'Synthwave & Electronic Gems (Spotify Sync)',
    description: 'Deep retro electronic pulse and synthesizer anthems.',
    coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&auto=format&fit=crop&q=80',
    trackIds: ['track-1', 'track-4', 'yt-2'],
    source: 'spotify'
  }
];
