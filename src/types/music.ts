export interface LyricLine {
  time: number; // in seconds
  text: string;
}

export type TrackSource = 'catalog' | 'local' | 'youtube' | 'spotify';

export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number; // in seconds
  audioUrl: string;
  coverUrl: string;
  dominantColor: string;
  secondaryColor?: string;
  lyrics: LyricLine[];
  genre: string;
  year?: number | string;
  source?: TrackSource;
  youtubeId?: string;
  spotifyId?: string;
  isLocal?: boolean;
  file?: File;
  plays?: number;
  bpm?: number;
  keySignature?: string;
  bitDepth?: string;
  sampleRate?: string;
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  coverUrl: string;
  trackIds: string[];
  isCustom?: boolean;
  source?: TrackSource;
  createdAt?: string;
}

export type RepeatMode = 'off' | 'all' | 'one';

export type EqualizerPreset = 
  | 'flat' 
  | 'cd-lossless'
  | 'bass-boost' 
  | 'vocal-booster'
  | 'spatial-surround'
  | 'acoustic' 
  | 'electronic' 
  | 'rock'
  | 'custom';

export type AudioQuality = 'lossless' | 'high' | 'normal' | 'saver';
export type AmbientGlowIntensity = 'vibrant' | 'subtle' | 'off';
export type LyricsFontSize = 'normal' | 'large' | 'huge';

export type ThemeAccent = 
  | 'dynamic' 
  | 'apple-rose' 
  | 'cyber-cyan' 
  | 'emerald' 
  | 'sunset-amber' 
  | 'royal-purple' 
  | 'electric-blue' 
  | 'oled-white';

export type BackgroundStyle = 
  | 'mesh-fluid' 
  | 'audio-reactive' 
  | 'minimal-glass' 
  | 'oled-pure-black';

export type PlaybackBarAnimation = 
  | 'shimmer' 
  | 'pulse' 
  | 'clean';

export type SoundbarStyle = 
  | 'apple-4bars' 
  | 'audiophile-8bars' 
  | 'subtle-3bars' 
  | 'off';

export type LyricsAlignment = 'center' | 'left';

export type TargetLufs = 'off' | 'spotify' | 'apple' | 'broadcast';

export type CrossfadeCurve = 'smooth' | 'linear' | 'exponential';

export type BufferPreload = 'balanced' | 'low-latency' | 'full-track';

export type StreamingBitrate = 'auto' | 'lossless-alac' | 'high-320' | 'data-saver';

export type ContentRegion = 'GLOBAL' | 'US' | 'IN' | 'GB' | 'JP' | 'KR' | 'DE';

export type DynamicIslandMode = 'smart' | 'always' | 'disabled';

export type VideoDefaultQuality = '1080p' | '720p' | '480p';

export type RecommendationMode = 'strict-cultural' | 'smart-blend' | 'global-eclectic';

export type CulturalPreference = 'auto' | 'bollywood' | 'punjabi' | 'western-pop' | 'all';

export type VisualizerMode = 'wave' | 'bars' | 'radial' | 'analog-vu';

export type SpatialRoom = 'off' | 'studio' | 'concert' | 'cathedral' | 'lounge';

export interface AppSettings {
  audioQuality: AudioQuality;
  crossfade: number; // in seconds (0 to 12)
  crossfadeCurve: CrossfadeCurve;
  soundCheck: boolean; // volume normalization
  targetLufs: TargetLufs;
  spatialAudio: boolean; // binaural spatial expansion
  stereoWidth: number; // 0 to 200%, default 100
  subBassBoost: number; // 0 to 12 dB, default 0
  bassCutoff: 40 | 60 | 80 | 120; // Hz
  vocalPresence: number; // 0 to 9 dB, default 0
  trebleAir: number; // 0 to 6 dB, default 0
  preampGain: number; // -12 to +12 dB, default 0
  ambientGlow: AmbientGlowIntensity;
  themeAccent: ThemeAccent;
  backgroundStyle: BackgroundStyle;
  playbackBarAnimation: PlaybackBarAnimation;
  soundbarStyle: SoundbarStyle;
  lyricsFontSize: LyricsFontSize;
  lyricsAlignment: LyricsAlignment;
  lyricsBlurInactive: boolean;
  lyricsRomanization: boolean;
  hapticFeedback: boolean;
  bufferPreload: BufferPreload;
  streamingBitrate: StreamingBitrate;
  contentRegion: ContentRegion;
  upscale4kArtwork: boolean;
  autoSkipSilence: boolean;
  pitchShiftSemitones: number;
  autoSleepOnTrackEnd: boolean;
  dynamicIslandMode: DynamicIslandMode;
  videoDefaultQuality: VideoDefaultQuality;
  recommendationMode?: RecommendationMode;
  culturalPreference?: CulturalPreference;
  smartAutoplay?: boolean;
  visualizerMode?: VisualizerMode;
  vocalReductionLevel?: number; // 0 to 100% (Apple Music Sing)
  spatialRoom?: SpatialRoom;
  tubeWarmth?: number; // 0 to 10 dB
  plugins: {
    youtubeMusic: boolean;
    spotifySync: boolean;
    soundcloud: boolean;
  };
}

export type ActiveTab = 
  | 'listen-now' 
  | 'browse' 
  | 'library' 
  | 'search' 
  | 'playlist' 
  | 'favorites'
  | 'local-files'
  | 'plugins'
  | 'room'
  | 'settings';
