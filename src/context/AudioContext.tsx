import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import type { 
  Track, 
  Playlist, 
  RepeatMode, 
  EqualizerPreset, 
  ActiveTab, 
  AppSettings,
  ThemeAccent,
  VisualizerMode,
  SpatialRoom
} from '../types/music';
import { INITIAL_TRACKS, INITIAL_PLAYLISTS } from '../data/catalog';
import { YOUTUBE_FEATURED_TRACKS, SPOTIFY_FEATURED_PLAYLISTS } from '../data/pluginsData';
import { parseAudioMetadata } from '../utils/id3Parser';
import { resolveYouTubeTrack, resolveSpotifyTrack } from '../utils/pluginUtils';
import { AudioDSPEngine, type SoundQualityMode } from '../utils/audioDSP';
import { parseBulkPlaylistInput } from '../utils/playlistImporter';
import { AUTO_EQ_PROFILES } from '../utils/autoEqData';
import { fetchLrclibLyrics } from '../utils/lrclib';
import { youtubeEngine } from '../utils/youtubeAudioEngine';
import confetti from 'canvas-confetti';
import { getSmartAutoplayTrack } from '../utils/recommendationEngine';
import { get4kArtworkUrl } from '../utils/artworkUtils';
import { pipIslandController } from '../utils/pipIslandController';
import { searchMusic, resolveDirectStream } from '../utils/serverlessMusicEngine';
import { triggerHaptic } from '../utils/haptics';
import { checkForAppUpdate, isAutoUpdateCheckEnabled, type UpdateInfo } from '../utils/updater';

export const getThemeAccentColor = (themeAccent: ThemeAccent, dominantColor?: string): string => {
  switch (themeAccent) {
    case 'apple-rose': return '#fa2d48';
    case 'cyber-cyan': return '#06b6d4';
    case 'emerald': return '#10b981';
    case 'sunset-amber': return '#f59e0b';
    case 'royal-purple': return '#a855f7';
    case 'electric-blue': return '#3b82f6';
    case 'oled-white': return '#f8fafc';
    case 'dynamic':
    default:
      return dominantColor || '#fa2d48';
  }
};

const DEFAULT_SETTINGS: AppSettings = {
  audioQuality: 'lossless',
  crossfade: 2,
  crossfadeCurve: 'smooth',
  soundCheck: true,
  targetLufs: 'apple',
  spatialAudio: true,
  stereoWidth: 100,
  subBassBoost: 0,
  bassCutoff: 60,
  vocalPresence: 0,
  trebleAir: 0,
  preampGain: 0,
  ambientGlow: 'vibrant',
  themeAccent: 'dynamic',
  backgroundStyle: 'mesh-fluid',
  playbackBarAnimation: 'shimmer',
  soundbarStyle: 'apple-4bars',
  lyricsFontSize: 'large',
  lyricsAlignment: 'center',
  lyricsBlurInactive: true,
  lyricsRomanization: false,
  hapticFeedback: true,
  bufferPreload: 'balanced',
  streamingBitrate: 'lossless-alac',
  contentRegion: 'GLOBAL',
  upscale4kArtwork: true,
  autoSkipSilence: true,
  pitchShiftSemitones: 0,
  autoSleepOnTrackEnd: false,
  dynamicIslandMode: 'smart',
  videoDefaultQuality: '720p',
  recommendationMode: 'strict-cultural',
  culturalPreference: 'auto',
  smartAutoplay: true,
  visualizerMode: 'wave',
  vocalReductionLevel: 0,
  spatialRoom: 'off',
  tubeWarmth: 0,
  plugins: {
    youtubeMusic: true,
    spotifySync: true,
    soundcloud: false,
  },
};

interface AudioContextType {
  // Playback state
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  buffered: number;
  repeatMode: RepeatMode;
  isShuffled: boolean;
  
  // Library & Catalog
  tracks: Track[];
  localTracks: Track[];
  youtubeTracks: Track[];
  playlists: Playlist[];
  favorites: string[];
  trackRegistry: Record<string, Track>;
  recentlyPlayed: Track[];
  clearRecentlyPlayed: () => void;
  
  // Navigation & Active View
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  selectedPlaylistId: string | null;
  setSelectedPlaylistId: (id: string | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Settings & Audiophile DSP
  settings: AppSettings;
  updateSettings: (partial: Partial<AppSettings>) => void;
  soundQualityMode: SoundQualityMode;
  setSoundQualityMode: (mode: SoundQualityMode) => void;
  vocalReductionLevel: number;
  setVocalReductionLevel: (level: number) => void;
  spatialRoom: SpatialRoom;
  setSpatialRoom: (room: SpatialRoom) => void;
  tubeWarmth: number;
  setTubeWarmth: (drive: number) => void;
  visualizerMode: VisualizerMode;
  setVisualizerMode: (mode: VisualizerMode) => void;

  // LastWave Features: Playback Speed, Sleep Timer, AutoEQ
  playbackSpeed: number;
  setPlaybackSpeed: (speed: number) => void;
  sleepTimerMinutes: number | null;
  sleepTimerRemaining: number | null;
  setSleepTimer: (minutes: number | null) => void;
  selectedAutoEQ: string | null;
  setAutoEQ: (profileId: string | null) => void;
  fetchLyricsFromLrclib: (track: Track) => Promise<boolean>;

  // Modals & Panels
  isLyricsOpen: boolean;
  setIsLyricsOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  isQueueOpen: boolean;
  setIsQueueOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  isEqualizerOpen: boolean;
  setIsEqualizerOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  isAudioQualityModalOpen: boolean;
  setIsAudioQualityModalOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  isFullscreen: boolean;
  setIsFullscreen: (open: boolean | ((prev: boolean) => boolean)) => void;
  isIslandActive: boolean;
  setIsIslandActive: (active: boolean | ((prev: boolean) => boolean)) => void;
  minimizeToIsland: () => void;
  dismissIsland: () => void;
  isCreatePlaylistOpen: boolean;
  setIsCreatePlaylistOpen: (open: boolean) => void;
  isVideoModalOpen: boolean;
  setIsVideoModalOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  isVideoPlaying: boolean;
  setIsVideoPlaying: (playing: boolean) => void;
  pauseAudioForVideo: () => void;
  resumeAudioAfterVideo: () => void;

  // Queue
  queue: Track[];
  queueIndex: number;
  playTrack: (track: Track, newQueue?: Track[]) => void;
  togglePlay: () => void;
  pause: () => void;
  resume: () => void;
  seek: (seconds: number) => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  skipNext: () => void;
  skipPrev: () => void;
  toggleShuffle: () => void;
  cycleRepeatMode: () => void;
  addToQueue: (track: Track) => void;
  playNext: (track: Track) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;

  // Equalizer & Web Audio
  equalizerPreset: EqualizerPreset;
  setEqualizerPreset: (preset: EqualizerPreset) => void;
  eqGains: number[];
  setEqBandGain: (bandIndex: number, gainDb: number) => void;
  analyserNode: AnalyserNode | null;

  // Theme & Visual Accent
  activeThemeColor: string;

  // Library & Plugin actions
  toggleFavorite: (trackId: string, trackObj?: Track) => void;
  isFavorite: (trackId: string) => boolean;
  createPlaylist: (name: string, description: string) => string;
  addTrackToPlaylist: (playlistId: string, trackId: string, trackObj?: Track) => void;
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => void;
  importLocalFiles: (files: FileList | File[]) => Promise<void>;
  importFromYouTube: (url: string) => Promise<boolean>;
  importFromSpotify: (url: string) => Promise<boolean>;
  importFullPlaylist: (input: string) => Promise<boolean>;
  searchOnline: (query: string) => Promise<Track[]>;
  exportLibraryData: () => string;
  importLibraryData: (jsonData: string) => boolean;

  // Picture-in-Picture Floating Dynamic Island
  requestPipIsland: () => Promise<boolean>;
  exitPipIsland: () => Promise<void>;
  isPipActive: () => boolean;

  // OTA Software Updater
  updateInfo: UpdateInfo | null;
  setUpdateInfo: (info: UpdateInfo | null) => void;
  isUpdateModalOpen: boolean;
  setIsUpdateModalOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  checkUpdates: (manual?: boolean) => Promise<UpdateInfo | null>;
  isCheckingUpdate: boolean;
}

const AudioContext = createContext<AudioContextType | null>(null);

const EQ_PRESET_GAINS: Record<EqualizerPreset, number[]> = {
  'flat': [0, 0, 0, 0, 0],
  'cd-lossless': [2.5, 1.5, 0, 1.5, 3.5],
  'bass-boost': [7.5, 4.5, 1, 0, 0],
  'vocal-booster': [-2, 0, 4.5, 5.5, 2],
  'spatial-surround': [3.5, -1, 1.5, 4, 6],
  'acoustic': [3, -1, 2, 4, 3],
  'electronic': [6, 3, 0, 3, 5],
  'rock': [5, 2, -2, 3, 6],
  'custom': [0, 0, 0, 0, 0]
};

const FREQUENCIES = [60, 250, 1000, 4000, 16000];

function calculateCrossfadeVolumes(
  progress: number,
  curve: 'smooth' | 'linear' | 'exponential' = 'smooth',
  maxVolume: number = 1.0
): { outgoing: number; incoming: number } {
  const p = Math.max(0, Math.min(1, progress));
  if (curve === 'linear') {
    return { outgoing: maxVolume * (1 - p), incoming: maxVolume * p };
  } else if (curve === 'exponential') {
    return { outgoing: maxVolume * Math.pow(1 - p, 2), incoming: maxVolume * Math.pow(p, 2) };
  } else {
    // Equal-power sinusoidal curve for zero dip in acoustic loudness
    const angle = p * (Math.PI / 2);
    return { outgoing: maxVolume * Math.cos(angle), incoming: maxVolume * Math.sin(angle) };
  }
}

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('aura_settings');
    if (saved) {
      try {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      } catch {
        return DEFAULT_SETTINGS;
      }
    }
    return DEFAULT_SETTINGS;
  });

  const [soundQualityMode, setSoundQualityModeState] = useState<SoundQualityMode>('dolby-atmos');
  const [playbackSpeed, setPlaybackSpeedState] = useState<number>(1.0);
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState<number | null>(null);
  const [sleepTimerRemaining, setSleepTimerRemaining] = useState<number | null>(null);
  const [selectedAutoEQ, setSelectedAutoEQ] = useState<string | null>(null);

  const updateSettings = (partial: Partial<AppSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...partial };
      localStorage.setItem('aura_settings', JSON.stringify(updated));
      return updated;
    });
  };

  // Tracks, Track Registry and Playlists state
  const [trackRegistry, setTrackRegistry] = useState<Record<string, Track>>(() => {
    const map: Record<string, Track> = {};
    [...INITIAL_TRACKS, ...YOUTUBE_FEATURED_TRACKS].forEach(t => {
      map[t.id] = t;
    });
    const saved = localStorage.getItem('aura_track_registry');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...map, ...parsed };
      } catch {
        // ignore
      }
    }
    return map;
  });

  const [tracks, setTracks] = useState<Track[]>(() => {
    const list = [...INITIAL_TRACKS, ...YOUTUBE_FEATURED_TRACKS];
    const saved = localStorage.getItem('aura_track_registry');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        Object.values(parsed).forEach((t: any) => {
          if (!list.some(x => x.id === t.id)) {
            list.push(t);
          }
        });
      } catch {
        // ignore
      }
    }
    return list;
  });

  const registerTrack = useCallback((track: Track) => {
    if (!track || !track.id) return;
    setTrackRegistry(prev => {
      if (prev[track.id]) return prev;
      const updated = { ...prev, [track.id]: track };
      try {
        localStorage.setItem('aura_track_registry', JSON.stringify(updated));
      } catch {
        // ignore storage quota
      }
      return updated;
    });
    setTracks(prev => {
      if (prev.some(t => t.id === track.id)) return prev;
      return [...prev, track];
    });
  }, []);

  const [localTracks, setLocalTracks] = useState<Track[]>([]);
  const [youtubeTracks, setYoutubeTracks] = useState<Track[]>(YOUTUBE_FEATURED_TRACKS);
  
  const [playlists, setPlaylists] = useState<Playlist[]>(() => {
    const saved = localStorage.getItem('aura_playlists');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const custom = parsed.filter((p: Playlist) => p.isCustom);
          return [...INITIAL_PLAYLISTS, ...SPOTIFY_FEATURED_PLAYLISTS, ...custom];
        }
      } catch {
        // ignore
      }
    }
    return [...INITIAL_PLAYLISTS, ...SPOTIFY_FEATURED_PLAYLISTS];
  });

  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('aura_favorites');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return ['track-1', 'track-3', 'track-4', 'yt-1'];
      }
    }
    return ['track-1', 'track-3', 'track-4', 'yt-1'];
  });

  // Recently Played History
  const [recentlyPlayed, setRecentlyPlayed] = useState<Track[]>(() => {
    const saved = localStorage.getItem('aura_recently_played');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        // ignore
      }
    }
    return [INITIAL_TRACKS[0], INITIAL_TRACKS[1], YOUTUBE_FEATURED_TRACKS[0]];
  });

  const clearRecentlyPlayed = () => {
    setRecentlyPlayed([]);
    localStorage.removeItem('aura_recently_played');
  };

  // Navigation
  const [activeTab, setActiveTab] = useState<ActiveTab>('listen-now');
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isLyricsOpen, setIsLyricsOpen] = useState(false);
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [isEqualizerOpen, setIsEqualizerOpen] = useState(false);
  const [isAudioQualityModalOpen, setIsAudioQualityModalOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isIslandActive, setIsIslandActive] = useState(false);

  const minimizeToIsland = useCallback(() => {
    setIsFullscreen(false);
    setIsIslandActive(true);
  }, []);

  const dismissIsland = useCallback(() => {
    setIsIslandActive(false);
  }, []);
  const [isCreatePlaylistOpen, setIsCreatePlaylistOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const wasAudioPlayingBeforeVideoRef = useRef(false);

  // OTA Software Updater State
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);

  const checkUpdates = useCallback(async (manual: boolean = false): Promise<UpdateInfo | null> => {
    setIsCheckingUpdate(true);
    try {
      const res = await checkForAppUpdate();
      setUpdateInfo(res);
      if (res && res.hasUpdate && manual) {
        setIsUpdateModalOpen(true);
      }
      return res;
    } catch (e) {
      console.warn('Update check failed:', e);
      return null;
    } finally {
      setIsCheckingUpdate(false);
    }
  }, []);

  // Periodic / startup auto update check
  useEffect(() => {
    if (isAutoUpdateCheckEnabled()) {
      const timer = setTimeout(() => {
        checkUpdates(false);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [checkUpdates]);

  // Audio Playback
  const [currentTrack, setCurrentTrack] = useState<Track | null>(INITIAL_TRACKS[0]);
  const [isPlaying, setIsPlaying] = useState(false);

  const pauseAudioForVideo = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      wasAudioPlayingBeforeVideoRef.current = !audio.paused;
      audio.pause();
    }
    setIsPlaying(false);
    setIsVideoPlaying(true);
  }, []);

  const resumeAudioAfterVideo = useCallback(() => {
    setIsVideoPlaying(false);
    const audio = audioRef.current;
    if (wasAudioPlayingBeforeVideoRef.current && audio) {
      audio.play().then(() => setIsPlaying(true)).catch(() => {});
    }
    wasAudioPlayingBeforeVideoRef.current = false;
  }, []);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(INITIAL_TRACKS[0].duration);
  const [volume, setVolumeState] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [buffered, setBuffered] = useState(0);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');
  const [isShuffled, setIsShuffled] = useState(false);

  // Queue
  const [queue, setQueue] = useState<Track[]>(() => [...INITIAL_TRACKS, ...YOUTUBE_FEATURED_TRACKS]);
  const [queueIndex, setQueueIndex] = useState(0);
  const originalQueueRef = useRef<Track[]>(queue);

  // Equalizer
  const [equalizerPreset, setEqualizerPresetState] = useState<EqualizerPreset>('flat');
  const [eqGains, setEqGains] = useState<number[]>([0, 0, 0, 0, 0]);
  const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(null);

  // Audio Engine & DSP Refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const crossfadeAudioRef = useRef<HTMLAudioElement | null>(null);
  const activeDeckRef = useRef<'A' | 'B'>('A');
  const isCrossfadingRef = useRef(false);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const crossfadeSourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const sourceNodeConnectedRef = useRef(false);
  const crossfadeSourceNodeConnectedRef = useRef(false);
  const corsFallbackAttemptedRef = useRef<Record<string, boolean>>({});
  const audioContextRef = useRef<AudioContext | null>(null);
  const eqFiltersRef = useRef<BiquadFilterNode[]>([]);
  const dspEngineRef = useRef<AudioDSPEngine>(new AudioDSPEngine());

  // Hardware MediaSession & PiP stable state tracking refs
  const currentTimeRef = useRef(currentTime);
  currentTimeRef.current = currentTime;
  const durationRef = useRef(duration);
  durationRef.current = duration;
  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;
  const playbackSpeedRef = useRef(1.0);
  const currentTrackRef = useRef(currentTrack);
  currentTrackRef.current = currentTrack;
  const lastMediaSessionSyncRef = useRef<number>(0);

  // Precise Position State Synchronization with Hardware Lockscreen & Headphone Audio Clock
  const syncMediaSessionPositionState = useCallback((
    posOverride?: number,
    durOverride?: number,
    rateOverride?: number,
    playingOverride?: boolean
  ) => {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;

    try {
      const isPlay = playingOverride !== undefined ? playingOverride : isPlayingRef.current;
      navigator.mediaSession.playbackState = isPlay ? 'playing' : 'paused';

      if ('setPositionState' in navigator.mediaSession) {
        const d = durOverride !== undefined ? durOverride : durationRef.current;
        const pos = posOverride !== undefined ? posOverride : currentTimeRef.current;
        const r = rateOverride !== undefined ? rateOverride : (playbackSpeedRef.current || 1.0);

        if (d > 0 && isFinite(d) && !isNaN(d)) {
          const clamped = Math.min(Math.max(0, pos), d);
          if (isFinite(clamped) && !isNaN(clamped)) {
            navigator.mediaSession.setPositionState({
              duration: d,
              playbackRate: r > 0 ? r : 1.0,
              position: clamped,
            });
          }
        }
      }
    } catch {
      // Safe no-op on non-supporting devices or rapid transition edge cases
    }
  }, []);

  // Active Theme Accent Color (supports dynamic track matching or user-selected custom palette)
  const activeThemeColor = getThemeAccentColor(settings.themeAccent, currentTrack?.dominantColor);

  // Synchronize DSP Engine with real-time settings (stereo widening, sub-bass, vocal presence, treble air, preamp, sing, tube warmth, room)
  useEffect(() => {
    dspEngineRef.current.setStereoWidth(settings.stereoWidth ?? 100);
    dspEngineRef.current.setSubBass(settings.subBassBoost ?? 0, settings.bassCutoff ?? 60);
    dspEngineRef.current.setVocalPresence(settings.vocalPresence ?? 0);
    dspEngineRef.current.setTrebleAir(settings.trebleAir ?? 0);
    dspEngineRef.current.setPreampGain(settings.preampGain ?? 0);
    dspEngineRef.current.setVocalReduction(settings.vocalReductionLevel ?? 0);
    dspEngineRef.current.setTubeWarmth(settings.tubeWarmth ?? 0);
    dspEngineRef.current.setSpatialRoom(settings.spatialRoom || 'off');
  }, [
    settings.stereoWidth,
    settings.subBassBoost,
    settings.bassCutoff,
    settings.vocalPresence,
    settings.trebleAir,
    settings.preampGain,
    settings.vocalReductionLevel,
    settings.tubeWarmth,
    settings.spatialRoom
  ]);

  const [visualizerMode, setVisualizerModeState] = useState<VisualizerMode>(settings.visualizerMode || 'wave');
  const [vocalReductionLevel, setVocalReductionLevelState] = useState<number>(settings.vocalReductionLevel ?? 0);
  const [spatialRoom, setSpatialRoomState] = useState<SpatialRoom>(settings.spatialRoom || 'off');
  const [tubeWarmth, setTubeWarmthState] = useState<number>(settings.tubeWarmth ?? 0);

  const setVisualizerMode = useCallback((mode: VisualizerMode) => {
    setVisualizerModeState(mode);
    updateSettings({ visualizerMode: mode });
  }, [updateSettings]);

  const setVocalReductionLevel = useCallback((level: number) => {
    setVocalReductionLevelState(level);
    updateSettings({ vocalReductionLevel: level });
    dspEngineRef.current.setVocalReduction(level);
  }, [updateSettings]);

  const setSpatialRoom = useCallback((room: SpatialRoom) => {
    setSpatialRoomState(room);
    updateSettings({ spatialRoom: room });
    dspEngineRef.current.setSpatialRoom(room);
  }, [updateSettings]);

  const setTubeWarmth = useCallback((drive: number) => {
    setTubeWarmthState(drive);
    updateSettings({ tubeWarmth: drive });
    dspEngineRef.current.setTubeWarmth(drive);
  }, [updateSettings]);

  // Sleep Timer Countdown & Fade-out effect
  useEffect(() => {
    if (sleepTimerRemaining === null || sleepTimerRemaining <= 0) return;

    const interval = setInterval(() => {
      setSleepTimerRemaining(prev => {
        if (prev === null || prev <= 1) {
          // Timer finished! Gently fade out audio and pause
          youtubeEngine.pause();
          if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.volume = volume;
          }
          setIsPlaying(false);
          setSleepTimerMinutes(null);
          return null;
        }

        // Gradually fade out volume over the final 10 seconds
        if (prev <= 10 && audioRef.current) {
          const fadeRatio = Math.max(0.05, (prev - 1) / 10);
          audioRef.current.volume = volume * fadeRatio;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [sleepTimerRemaining, volume]);

  const setSleepTimer = (minutes: number | null) => {
    setSleepTimerMinutes(minutes);
    if (minutes === -1) {
      // End of Track
      const remain = Math.max(5, Math.round((durationRef.current || 180) - (currentTimeRef.current || 0)));
      setSleepTimerRemaining(remain);
    } else if (minutes && minutes > 0) {
      setSleepTimerRemaining(minutes * 60);
    } else {
      setSleepTimerRemaining(null);
      if (audioRef.current) audioRef.current.volume = volume;
    }
  };

  // Set Playback Speed (Tempo Control from LastWave)
  const setPlaybackSpeed = (speed: number) => {
    const clamped = Math.max(0.5, Math.min(2.0, speed));
    setPlaybackSpeedState(clamped);
    playbackSpeedRef.current = clamped;
    youtubeEngine.setPlaybackRate(clamped);
    if (audioRef.current) {
      audioRef.current.playbackRate = clamped;
    }
    syncMediaSessionPositionState(currentTimeRef.current, durationRef.current, clamped, isPlayingRef.current);
  };

  const setEqualizerPreset = (preset: EqualizerPreset) => {
    setEqualizerPresetState(preset);
    setSelectedAutoEQ(null);
    if (preset !== 'custom') {
      const presetGains = [...EQ_PRESET_GAINS[preset]];
      setEqGains(presetGains);
      if (eqFiltersRef.current.length === 5) {
        eqFiltersRef.current.forEach((filter, index) => {
          filter.gain.setTargetAtTime(presetGains[index], audioContextRef.current?.currentTime || 0, 0.05);
        });
      }
    }
  };

  const setEqBandGain = (bandIndex: number, gainDb: number) => {
    const clamped = Math.max(-12, Math.min(12, gainDb));
    setEqGains(prev => {
      const next = [...prev];
      next[bandIndex] = clamped;
      return next;
    });
    setEqualizerPresetState('custom');
    setSelectedAutoEQ(null);
    if (eqFiltersRef.current[bandIndex]) {
      eqFiltersRef.current[bandIndex].gain.setTargetAtTime(clamped, audioContextRef.current?.currentTime || 0, 0.05);
    }
  };

  // Set AutoEQ Profile (Headphone Calibration from LastWave)
  const setAutoEQ = (profileId: string | null) => {
    setSelectedAutoEQ(profileId);
    if (!profileId) {
      // Revert to current equalizerPreset
      const gains = equalizerPreset === 'custom' ? eqGains : EQ_PRESET_GAINS[equalizerPreset];
      setEqGains(gains);
      eqFiltersRef.current.forEach((filter, index) => {
        filter.gain.setTargetAtTime(gains[index], audioContextRef.current?.currentTime || 0, 0.05);
      });
      return;
    }

    const profile = AUTO_EQ_PROFILES.find(p => p.id === profileId);
    if (profile && eqFiltersRef.current.length === 5) {
      setEqGains([...profile.gains]);
      eqFiltersRef.current.forEach((filter, index) => {
        filter.gain.setTargetAtTime(profile.gains[index], audioContextRef.current?.currentTime || 0, 0.05);
      });
    }
  };

  // Online music search helper (Serverless Multi-Provider: JioSaavn 320kbps + iTunes)
  const searchOnline = async (query: string): Promise<Track[]> => {
    if (!query.trim()) return [];
    try {
      const tracks = await searchMusic(query.trim());
      if (tracks && tracks.length > 0) {
        tracks.forEach((t: Track) => registerTrack(t));
        return tracks;
      }
    } catch (err) {
      console.warn('[Audio] Online search failed:', err);
    }
    return [];
  };

  const fetchLyricsFromLrclib = async (track: Track): Promise<boolean> => {
    try {
      const lrcLyrics = await fetchLrclibLyrics(track.title, track.artist);
      if (lrcLyrics && lrcLyrics.length > 0) {
        setTracks(prev => prev.map(t => t.id === track.id ? { ...t, lyrics: lrcLyrics } : t));
        setQueue(prev => prev.map(t => t.id === track.id ? { ...t, lyrics: lrcLyrics } : t));
        setCurrentTrack(curr => (curr?.id === track.id ? { ...curr, lyrics: lrcLyrics } : curr));
        return true;
      }
    } catch (e) {
      console.warn('Failed to fetch LRCLIB lyrics:', e);
    }
    return false;
  };

  // Helper functions for dual-deck access
  const getActiveDeckAudio = useCallback(() => {
    return activeDeckRef.current === 'A' ? audioRef.current : crossfadeAudioRef.current;
  }, []);

  const getInactiveDeckAudio = useCallback(() => {
    return activeDeckRef.current === 'A' ? crossfadeAudioRef.current : audioRef.current;
  }, []);

  // Initialize Audio Elements and Web Audio API
  useEffect(() => {
    const audioA = audioRef.current;
    const audioB = crossfadeAudioRef.current;
    if (!audioA) return;
    (window as any).__audio = audioA;

    // Set initial track source so bottom player is immediately ready on first click
    if (INITIAL_TRACKS[0]?.audioUrl) {
      audioA.src = INITIAL_TRACKS[0].audioUrl;
    }

    const handleDeckTimeUpdate = (deckType: 'A' | 'B') => {
      // Only process state for the currently active deck
      if (activeDeckRef.current !== deckType) return;
      const activeAudio = deckType === 'A' ? audioA : audioB;
      const inactiveAudio = deckType === 'A' ? audioB : audioA;
      if (!activeAudio) return;

      setCurrentTime(activeAudio.currentTime);
      currentTimeRef.current = activeAudio.currentTime;
      if (activeAudio.buffered.length > 0) {
        const bufferedEnd = activeAudio.buffered.end(activeAudio.buffered.length - 1);
        const dur = activeAudio.duration || 1;
        setBuffered(Math.min((bufferedEnd / dur) * 100, 100));
      }

      // Synchronize phone lockscreen widget with hardware clock every 1.2s
      const now = Date.now();
      if (now - lastMediaSessionSyncRef.current > 1200) {
        lastMediaSessionSyncRef.current = now;
        syncMediaSessionPositionState(activeAudio.currentTime, activeAudio.duration, activeAudio.playbackRate, !activeAudio.paused);
      }

      // Real Dual-Deck Gapless Crossfade Pipeline
      const crossfadeDuration = settings.crossfade ?? 2;
      const cur = activeAudio.currentTime;
      const dur = activeAudio.duration;

      if (
        crossfadeDuration > 0 &&
        dur > 15 &&
        dur - cur <= crossfadeDuration &&
        dur - cur > 0 &&
        !isCrossfadingRef.current &&
        inactiveAudio
      ) {
        // Look up next track in the queue
        let nextIndex = queueIndex + 1;
        if (repeatMode === 'one') {
          nextIndex = queueIndex;
        } else if (nextIndex >= queue.length) {
          nextIndex = repeatMode === 'all' ? 0 : -1;
        }

        if (nextIndex >= 0 && queue[nextIndex]) {
          const nextTrack = queue[nextIndex];
          isCrossfadingRef.current = true;

          const startCrossfadeDeck = (streamUrl: string) => {
            if (!inactiveAudio) return;
            inactiveAudio.crossOrigin = 'anonymous';
            if (inactiveAudio.src !== streamUrl) {
              inactiveAudio.src = streamUrl;
            }
            inactiveAudio.currentTime = 0;
            inactiveAudio.playbackRate = playbackSpeedRef.current || 1.0;
            const targetVol = isMuted ? 0 : volume;
            const { outgoing, incoming } = calculateCrossfadeVolumes(0, settings.crossfadeCurve, targetVol);
            inactiveAudio.volume = incoming;
            activeAudio.volume = outgoing;
            inactiveAudio.play().catch(e => console.warn('[Crossfade] Secondary deck initial play note:', e));
          };

          if (nextTrack.audioUrl) {
            startCrossfadeDeck(nextTrack.audioUrl);
          } else {
            resolveDirectStream(nextTrack).then(url => {
              if (url && isCrossfadingRef.current) {
                nextTrack.audioUrl = url;
                startCrossfadeDeck(url);
              }
            });
          }
        }
      }

      // Live volume curve interpolation while crossfading
      if (isCrossfadingRef.current && inactiveAudio && crossfadeDuration > 0) {
        const remaining = Math.max(0, dur - cur);
        const p = Math.max(0, Math.min(1, 1 - (remaining / crossfadeDuration)));
        const targetVol = isMuted ? 0 : volume;
        const { outgoing, incoming } = calculateCrossfadeVolumes(p, settings.crossfadeCurve, targetVol);
        activeAudio.volume = outgoing;
        inactiveAudio.volume = incoming;

        if (remaining <= 0.25 || activeAudio.ended) {
          // Crossfade completed: finalize deck switchover
          isCrossfadingRef.current = false;
          activeAudio.pause();
          activeAudio.volume = isMuted ? 0 : volume;
          inactiveAudio.volume = isMuted ? 0 : volume;
          activeDeckRef.current = deckType === 'A' ? 'B' : 'A';
          (window as any).__audio = inactiveAudio;

          let nextIdx = (queueIndex + 1) % queue.length;
          if (repeatMode === 'one') nextIdx = queueIndex;
          setQueueIndex(nextIdx);
          const nextT = queue[nextIdx];
          if (nextT) {
            setCurrentTrack(nextT);
            currentTrackRef.current = nextT;
            syncMediaSessionPositionState(0, nextT.duration, playbackSpeedRef.current, true);
          }
        }
      }
    };

    const handleDeckLoadedMetadata = (deck: HTMLAudioElement, deckType: 'A' | 'B') => {
      if (activeDeckRef.current === deckType && deck.duration && !isNaN(deck.duration) && isFinite(deck.duration) && deck.duration > 0) {
        setDuration(deck.duration);
      }
    };

    const handleDeckPlay = (deckType: 'A' | 'B') => {
      if (activeDeckRef.current === deckType) setIsPlaying(true);
    };

    const handleDeckPause = (deckType: 'A' | 'B') => {
      if (activeDeckRef.current === deckType && !isCrossfadingRef.current) setIsPlaying(false);
    };

    const handleDeckWaiting = (deckType: 'A' | 'B') => {
      if (activeDeckRef.current === deckType) setBuffered(25);
    };

    const handleDeckPlaying = (deckType: 'A' | 'B') => {
      if (activeDeckRef.current === deckType) {
        setIsPlaying(true);
        setBuffered(100);
      }
    };

    const handleDeckError = (deck: HTMLAudioElement) => {
      const err = deck.error;
      console.error('[AUDIO] error event fired! Code:', err?.code, 'Message:', err?.message, 'src:', deck.src);

      // CORS Safety Fallback:
      // If external stream was rejected due to crossOrigin='anonymous', retry directly without CORS
      if (deck.crossOrigin && deck.src && !corsFallbackAttemptedRef.current[deck.src]) {
        console.warn('[AUDIO] CORS error on stream. Retrying directly without CORS restrictions...');
        corsFallbackAttemptedRef.current[deck.src] = true;
        const currentSrc = deck.src;
        const curTime = deck.currentTime || 0;
        deck.removeAttribute('crossorigin');
        (deck as any).crossOrigin = null;
        deck.src = currentSrc;
        deck.load();
        if (isPlayingRef.current) {
          deck.currentTime = curTime;
          deck.play().catch(e => console.warn('[AUDIO] Play retry failed:', e));
        }
        return;
      }

      setIsPlaying(false);
    };

    const onTimeUpdateA = () => handleDeckTimeUpdate('A');
    const onTimeUpdateB = () => handleDeckTimeUpdate('B');
    const onMetadataA = () => handleDeckLoadedMetadata(audioA, 'A');
    const onMetadataB = () => audioB && handleDeckLoadedMetadata(audioB, 'B');
    const onPlayA = () => handleDeckPlay('A');
    const onPlayB = () => handleDeckPlay('B');
    const onPauseA = () => handleDeckPause('A');
    const onPauseB = () => handleDeckPause('B');
    const onWaitingA = () => handleDeckWaiting('A');
    const onWaitingB = () => handleDeckWaiting('B');
    const onPlayingA = () => handleDeckPlaying('A');
    const onPlayingB = () => handleDeckPlaying('B');
    const onErrorA = () => handleDeckError(audioA);
    const onErrorB = () => audioB && handleDeckError(audioB);

    audioA.addEventListener('timeupdate', onTimeUpdateA);
    audioA.addEventListener('loadedmetadata', onMetadataA);
    audioA.addEventListener('play', onPlayA);
    audioA.addEventListener('pause', onPauseA);
    audioA.addEventListener('waiting', onWaitingA);
    audioA.addEventListener('playing', onPlayingA);
    audioA.addEventListener('error', onErrorA);

    if (audioB) {
      audioB.addEventListener('timeupdate', onTimeUpdateB);
      audioB.addEventListener('loadedmetadata', onMetadataB);
      audioB.addEventListener('play', onPlayB);
      audioB.addEventListener('pause', onPauseB);
      audioB.addEventListener('waiting', onWaitingB);
      audioB.addEventListener('playing', onPlayingB);
      audioB.addEventListener('error', onErrorB);
    }

    return () => {
      audioA.removeEventListener('timeupdate', onTimeUpdateA);
      audioA.removeEventListener('loadedmetadata', onMetadataA);
      audioA.removeEventListener('play', onPlayA);
      audioA.removeEventListener('pause', onPauseA);
      audioA.removeEventListener('waiting', onWaitingA);
      audioA.removeEventListener('playing', onPlayingA);
      audioA.removeEventListener('error', onErrorA);
      audioA.pause();

      if (audioB) {
        audioB.removeEventListener('timeupdate', onTimeUpdateB);
        audioB.removeEventListener('loadedmetadata', onMetadataB);
        audioB.removeEventListener('play', onPlayB);
        audioB.removeEventListener('pause', onPauseB);
        audioB.removeEventListener('waiting', onWaitingB);
        audioB.removeEventListener('playing', onPlayingB);
        audioB.removeEventListener('error', onErrorB);
        audioB.pause();
      }
    };
  }, [queue, queueIndex, repeatMode, settings.crossfade, settings.crossfadeCurve, volume, isMuted, syncMediaSessionPositionState]);

  // Web Audio Context initialization on first interaction
  const initWebAudio = useCallback(() => {
    if (audioContextRef.current) return;

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      // Keep Web Audio API analyzer active across background app state switches
      ctx.onstatechange = () => {
        if (ctx.state === 'suspended' && isPlayingRef.current) {
          ctx.resume().catch(() => {});
        }
      };

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 128;
      analyser.smoothingTimeConstant = 0.8;
      setAnalyserNode(analyser);

      const filters = FREQUENCIES.map((freq, index) => {
        const filter = ctx.createBiquadFilter();
        if (index === 0) {
          filter.type = 'lowshelf';
        } else if (index === FREQUENCIES.length - 1) {
          filter.type = 'highshelf';
        } else {
          filter.type = 'peaking';
          filter.Q.value = 1.0;
        }
        filter.frequency.value = freq;
        filter.gain.value = 0;
        return filter;
      });
      eqFiltersRef.current = filters;

      // Live Web Audio DSP Graph with single-attachment guard for Deck A
      if (!sourceNodeConnectedRef.current && audioRef.current) {
        try {
          const source = ctx.createMediaElementSource(audioRef.current);
          sourceNodeRef.current = source;
          sourceNodeConnectedRef.current = true;

          let prevNode: AudioNode = source;
          for (const filter of filters) {
            prevNode.connect(filter);
            prevNode = filter;
          }
          prevNode.connect(analyser);

          dspEngineRef.current.init(ctx, analyser, ctx.destination);
          dspEngineRef.current.setMode(soundQualityMode);
          console.log('[AudioDSP] Deck A Web Audio API graph & 5-band EQ successfully wired to destination.');
        } catch (sourceErr) {
          console.warn('[AudioDSP] Web Audio primary source wiring warning:', sourceErr);
        }
      }

      // Live Web Audio DSP Graph with single-attachment guard for Deck B (Dual-deck crossfade)
      if (!crossfadeSourceNodeConnectedRef.current && crossfadeAudioRef.current && filters[0]) {
        try {
          const crossSource = ctx.createMediaElementSource(crossfadeAudioRef.current);
          crossfadeSourceNodeRef.current = crossSource;
          crossfadeSourceNodeConnectedRef.current = true;
          crossSource.connect(filters[0]);
          console.log('[AudioDSP] Deck B crossfade source wired into DSP graph.');
        } catch (crossErr) {
          console.warn('[AudioDSP] Crossfade deck source wiring warning:', crossErr);
        }
      }
    } catch (err) {
      console.warn('Web Audio initialization error:', err);
    }
  }, [soundQualityMode]);

  const setSoundQualityMode = (mode: SoundQualityMode) => {
    setSoundQualityModeState(mode);
    dspEngineRef.current.setMode(mode);
  };

  useEffect(() => {
    if (selectedAutoEQ) {
      setAutoEQ(selectedAutoEQ);
    } else if (eqFiltersRef.current.length === 5) {
      const gains = equalizerPreset === 'custom' ? eqGains : EQ_PRESET_GAINS[equalizerPreset];
      eqFiltersRef.current.forEach((filter, index) => {
        filter.gain.setTargetAtTime(gains[index], audioContextRef.current?.currentTime || 0, 0.05);
      });
    }
  }, [equalizerPreset, selectedAutoEQ, eqGains]);

  const setVolume = (val: number) => {
    const clamped = Math.max(0, Math.min(1, val));
    setVolumeState(clamped);
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : clamped;
    }
    if (crossfadeAudioRef.current) {
      crossfadeAudioRef.current.volume = isMuted ? 0 : clamped;
    }
    if (clamped > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (isMuted) {
      if (audioRef.current) {
        audioRef.current.volume = volume;
      }
      if (crossfadeAudioRef.current) {
        crossfadeAudioRef.current.volume = volume;
      }
      setIsMuted(false);
    } else {
      if (audioRef.current) {
        audioRef.current.volume = 0;
      }
      if (crossfadeAudioRef.current) {
        crossfadeAudioRef.current.volume = 0;
      }
      setIsMuted(true);
    }
  };

  const playTrack = useCallback((track: Track, newQueue?: Track[]) => {
    initWebAudio();
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume().catch(() => {});
    }

    let activeQ = queue;
    if (newQueue && newQueue.length > 0) {
      activeQ = newQueue;
      originalQueueRef.current = [...newQueue];
      setQueue(newQueue);
    }

    const index = activeQ.findIndex(t => t.id === track.id);
    setQueueIndex(index !== -1 ? index : 0);
    setCurrentTrack(track);

    registerTrack(track);
    setRecentlyPlayed(prev => {
      const filtered = prev.filter(t => t.id !== track.id);
      const updated = [track, ...filtered].slice(0, 50);
      try {
        localStorage.setItem('aura_recently_played', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });

    if (track.duration && !isNaN(track.duration)) {
      setDuration(track.duration);
    }

    // If track has no lyrics or incomplete snippet, fetch complete synced lyrics from LRCLIB
    if (!track.lyrics || track.lyrics.length < 15) {
      fetchLyricsFromLrclib(track).catch(() => {});
    }

    // Dynamically fetch and register related songs by artist and genre for coherent recommendations
    const cleanArt = track.artist.replace(/\s*\d+(\.\d+)?\s*[MKmk]?\s*views.*$/i, '').trim();
    if (cleanArt && cleanArt.length > 2 && !['Various Artists', 'Unknown Artist', '88M views'].includes(cleanArt)) {
      searchMusic(cleanArt + ' songs')
        .then(resTracks => {
          if (Array.isArray(resTracks) && resTracks.length > 0) {
            resTracks.forEach((t: Track) => registerTrack(t));
          }
        })
        .catch(() => {});
    }

    // Direct Native HTML5 Audio Streaming for all online and local tracks
    isCrossfadingRef.current = false;
    const activeDeck = getActiveDeckAudio();
    const inactiveDeck = getInactiveDeckAudio();

    if (inactiveDeck) {
      inactiveDeck.pause();
      inactiveDeck.currentTime = 0;
      inactiveDeck.volume = isMuted ? 0 : volume;
    }

    if (activeDeck) {
      const executeAudioPlay = (src: string) => {
        activeDeck.crossOrigin = 'anonymous';
        if (activeDeck.src !== src) {
          activeDeck.src = src;
        }
        activeDeck.playbackRate = playbackSpeed;
        activeDeck.volume = isMuted ? 0 : volume;

        const playPromise = activeDeck.play();
        if (playPromise !== undefined) {
          playPromise.then(() => {
            setIsPlaying(true);
            isPlayingRef.current = true;
            syncMediaSessionPositionState(0, track.duration, playbackSpeed, true);
          }).catch((err) => {
            console.warn('[Audio] Direct audio play error or gesture needed:', err);
          });
        } else {
          setIsPlaying(true);
          isPlayingRef.current = true;
          syncMediaSessionPositionState(0, track.duration, playbackSpeed, true);
        }
      };

      // 1. If track already has direct stream URL (e.g. JioSaavn 320kbps or iTunes)
      if (track.audioUrl && (track.audioUrl.startsWith('https://') || track.audioUrl.startsWith('http://'))) {
        executeAudioPlay(track.audioUrl);
      } else {
        // 2. On-the-fly resolution via serverless music engine (<300ms)
        resolveDirectStream(track)
          .then((directStream) => {
            if (directStream) {
              track.audioUrl = directStream;
              registerTrack({ ...track, audioUrl: directStream });
              executeAudioPlay(directStream);
            } else if (track.youtubeId) {
              youtubeEngine.loadAndPlay(track.youtubeId);
              setIsPlaying(true);
            }
          })
          .catch((err) => {
            console.warn('[Audio] Direct stream resolution fallback:', err);
            if (track.youtubeId) {
              youtubeEngine.loadAndPlay(track.youtubeId);
              setIsPlaying(true);
            }
          });
      }
    }
  }, [initWebAudio, queue, playbackSpeed, isMuted, volume, syncMediaSessionPositionState]);

  const skipNext = useCallback(() => {
    triggerHaptic('medium');
    if (queue.length === 0) return;
    let nextIndex = queueIndex + 1;
    if (nextIndex >= queue.length) {
      if (repeatMode === 'all') {
        nextIndex = 0;
      } else {
        // Infinite Smart Autoplay (Spotify / Apple Music algorithm)
        const allKnownTracks = [
          ...tracks,
          ...Object.values(trackRegistry),
          ...youtubeTracks,
          ...localTracks
        ];
        if (currentTrack && allKnownTracks.length > 1) {
          const autoplayTrack = getSmartAutoplayTrack({
            currentTrack,
            allTracks: allKnownTracks,
            recentlyPlayed
          });
          if (autoplayTrack && autoplayTrack.id !== currentTrack.id) {
            setQueue(prev => [...prev, autoplayTrack]);
            setQueueIndex(queue.length);
            playTrack(autoplayTrack);
            return;
          }
        }
        setIsPlaying(false);
        return;
      }
    }
    setQueueIndex(nextIndex);
    const nextTrack = queue[nextIndex];
    if (nextTrack) {
      playTrack(nextTrack);
    }
  }, [queue, queueIndex, repeatMode, playTrack, tracks, trackRegistry, youtubeTracks, localTracks, currentTrack, recentlyPlayed]);

  const skipPrev = useCallback(() => {
    triggerHaptic('medium');
    if (audioRef.current && audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      return;
    }
    if (queue.length === 0) return;
    let prevIndex = queueIndex - 1;
    if (prevIndex < 0) {
      prevIndex = queue.length - 1;
    }
    setQueueIndex(prevIndex);
    const prevTrack = queue[prevIndex];
    if (prevTrack) {
      playTrack(prevTrack);
    }
  }, [queue, queueIndex, playTrack]);

  useEffect(() => {
    const handleEndedA = () => {
      if (activeDeckRef.current !== 'A' || isCrossfadingRef.current) return;
      if (repeatMode === 'one') {
        const audio = audioRef.current;
        if (audio) {
          audio.currentTime = 0;
          audio.play().catch(() => {});
        }
      } else {
        skipNext();
      }
    };

    const handleEndedB = () => {
      if (activeDeckRef.current !== 'B' || isCrossfadingRef.current) return;
      if (repeatMode === 'one') {
        const audio = crossfadeAudioRef.current;
        if (audio) {
          audio.currentTime = 0;
          audio.play().catch(() => {});
        }
      } else {
        skipNext();
      }
    };

    const audioA = audioRef.current;
    const audioB = crossfadeAudioRef.current;

    audioA?.addEventListener('ended', handleEndedA);
    audioB?.addEventListener('ended', handleEndedB);

    return () => {
      audioA?.removeEventListener('ended', handleEndedA);
      audioB?.removeEventListener('ended', handleEndedB);
    };
  }, [repeatMode, skipNext]);

  const togglePlay = () => {
    triggerHaptic('medium');
    initWebAudio();
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume().catch(() => {});
    }

    const audio = getActiveDeckAudio();
    if (!audio) return;

    if (isPlaying) {
      pause();
    } else {
      if ((!audio.src || audio.src === window.location.href) && currentTrack) {
        if (currentTrack.audioUrl && (currentTrack.audioUrl.startsWith('https://') || currentTrack.audioUrl.startsWith('http://'))) {
          audio.src = currentTrack.audioUrl;
        } else {
          resolveDirectStream(currentTrack).then(resUrl => {
            if (resUrl) {
              currentTrack.audioUrl = resUrl;
              audio.src = resUrl;
              audio.play().catch(() => {});
            }
          }).catch(() => {});
        }
      }
      audio.playbackRate = playbackSpeed;
      audio.volume = isMuted ? 0 : volume;
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          setIsPlaying(true);
          isPlayingRef.current = true;
          syncMediaSessionPositionState(audio.currentTime, durationRef.current, playbackSpeedRef.current, true);
        }).catch(e => {
          console.warn('[Audio] togglePlay error:', e);
          setIsPlaying(false);
          isPlayingRef.current = false;
          syncMediaSessionPositionState(audio.currentTime, durationRef.current, playbackSpeedRef.current, false);
        });
      } else {
        setIsPlaying(true);
        isPlayingRef.current = true;
        syncMediaSessionPositionState(audio.currentTime, durationRef.current, playbackSpeedRef.current, true);
      }
    }
  };

  const pause = () => {
    const audioA = audioRef.current;
    const audioB = crossfadeAudioRef.current;
    if (audioA) audioA.pause();
    if (audioB) audioB.pause();
    setIsPlaying(false);
    isPlayingRef.current = false;
    syncMediaSessionPositionState(currentTimeRef.current, durationRef.current, playbackSpeedRef.current, false);
  };

  const resume = () => {
    initWebAudio();
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume().catch(() => {});
    }
    const audio = getActiveDeckAudio();
    if (audio) {
      audio.play().then(() => {
        setIsPlaying(true);
        isPlayingRef.current = true;
        syncMediaSessionPositionState(currentTimeRef.current, durationRef.current, playbackSpeedRef.current, true);
      }).catch(() => {});
    }
  };

  const seek = (seconds: number) => {
    const clamped = Math.max(0, Math.min(seconds, duration || seconds));
    setCurrentTime(clamped);
    currentTimeRef.current = clamped;
    const audio = getActiveDeckAudio();
    if (audio) {
      audio.currentTime = clamped;
    }
    syncMediaSessionPositionState(clamped, durationRef.current, playbackSpeedRef.current, isPlayingRef.current);
  };

  const toggleShuffle = () => {
    if (isShuffled) {
      const orig = originalQueueRef.current;
      setQueue(orig);
      const idx = orig.findIndex(t => t.id === currentTrack?.id);
      setQueueIndex(idx !== -1 ? idx : 0);
      setIsShuffled(false);
    } else {
      if (queue.length <= 1) return;
      const current = currentTrack;
      const rest = queue.filter(t => t.id !== current?.id);
      for (let i = rest.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [rest[i], rest[j]] = [rest[j], rest[i]];
      }
      const shuffledQueue = current ? [current, ...rest] : rest;
      setQueue(shuffledQueue);
      setQueueIndex(0);
      setIsShuffled(true);
    }
  };

  const cycleRepeatMode = () => {
    setRepeatMode(prev => {
      if (prev === 'off') return 'all';
      if (prev === 'all') return 'one';
      return 'off';
    });
  };

  const addToQueue = (track: Track) => {
    setQueue(prev => [...prev, track]);
  };

  const playNext = (track: Track) => {
    setQueue(prev => {
      const copy = [...prev];
      copy.splice(queueIndex + 1, 0, track);
      return copy;
    });
  };

  const removeFromQueue = (index: number) => {
    setQueue(prev => {
      const copy = [...prev];
      copy.splice(index, 1);
      return copy;
    });
    if (index < queueIndex) {
      setQueueIndex(prev => prev - 1);
    }
  };

  const clearQueue = () => {
    if (currentTrack) {
      setQueue([currentTrack]);
      setQueueIndex(0);
    } else {
      setQueue([]);
      setQueueIndex(0);
    }
  };

  const toggleFavorite = (trackId: string, trackObj?: Track) => {
    if (trackObj) {
      registerTrack(trackObj);
    } else if (currentTrack && currentTrack.id === trackId) {
      registerTrack(currentTrack);
    }

    setFavorites(prev => {
      const exists = prev.includes(trackId);
      let updated: string[];
      if (exists) {
        updated = prev.filter(id => id !== trackId);
      } else {
        try {
          confetti({
            particleCount: 40,
            spread: 55,
            origin: { y: 0.85, x: 0.15 },
            colors: ['#fa2d48', '#f43f5e', '#ec4899', '#ffffff']
          });
        } catch {
          // ignore
        }
        updated = [...prev, trackId];
      }
      try {
        localStorage.setItem('aura_favorites', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const isFavorite = (trackId: string) => favorites.includes(trackId);

  const createPlaylist = (name: string, description: string): string => {
    const id = `playlist-${Date.now()}`;
    const newPlaylist: Playlist = {
      id,
      name,
      description: description || 'User curated collection.',
      coverUrl: currentTrack ? currentTrack.coverUrl : 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
      trackIds: currentTrack ? [currentTrack.id] : [],
      isCustom: true,
      createdAt: new Date().toLocaleDateString()
    };
    if (currentTrack) {
      registerTrack(currentTrack);
    }
    setPlaylists(prev => {
      const updated = [...prev, newPlaylist];
      try {
        localStorage.setItem('aura_playlists', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
    return id;
  };

  const addTrackToPlaylist = (playlistId: string, trackId: string, trackObj?: Track) => {
    if (trackObj) {
      registerTrack(trackObj);
    } else if (currentTrack && currentTrack.id === trackId) {
      registerTrack(currentTrack);
    }
    setPlaylists(prev => {
      const updated = prev.map(p => {
        if (p.id === playlistId && !p.trackIds.includes(trackId)) {
          return { ...p, trackIds: [...p.trackIds, trackId] };
        }
        return p;
      });
      try {
        localStorage.setItem('aura_playlists', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const removeTrackFromPlaylist = (playlistId: string, trackId: string) => {
    setPlaylists(prev => {
      const updated = prev.map(p => {
        if (p.id === playlistId) {
          return { ...p, trackIds: p.trackIds.filter(id => id !== trackId) };
        }
        return p;
      });
      try {
        localStorage.setItem('aura_playlists', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const importLocalFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const newTracks: Track[] = [];

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      if (!file.type.startsWith('audio/') && !/\.(mp3|wav|flac|aac|ogg|m4a)$/i.test(file.name)) {
        continue;
      }

      const meta = await parseAudioMetadata(file);
      const blobUrl = URL.createObjectURL(file);
      const trackId = `local-${Date.now()}-${i}`;

      const track: Track = {
        id: trackId,
        title: meta.title,
        artist: meta.artist,
        album: meta.album,
        duration: meta.duration || 180,
        audioUrl: blobUrl,
        coverUrl: meta.coverUrl || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=80',
        dominantColor: '#fa2d48',
        secondaryColor: '#3b82f6',
        genre: meta.genre,
        year: meta.year || '2026',
        isLocal: true,
        source: 'local',
        file: file,
        lyrics: [
          { time: 0, text: `Playing local file: ${file.name}` },
          { time: 5, text: `Artist: ${meta.artist}` },
          { time: 10, text: `Album: ${meta.album}` },
          { time: 20, text: '• • • (Enjoy your local audio collection) • • •' }
        ]
      };

      newTracks.push(track);
    }

    if (newTracks.length > 0) {
      setLocalTracks(prev => [...newTracks, ...prev]);
      setTracks(prev => [...prev, ...newTracks]);
      playTrack(newTracks[0], [...newTracks, ...queue]);
    }
  };

  const importFromYouTube = async (url: string): Promise<boolean> => {
    const track = await resolveYouTubeTrack(url);
    if (!track) return false;

    setYoutubeTracks(prev => [track, ...prev]);
    setTracks(prev => [track, ...prev]);
    playTrack(track, [track, ...queue]);
    
    try {
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#ef4444', '#f97316', '#ffffff']
      });
    } catch {
      // ignore
    }

    return true;
  };

  const importFromSpotify = async (url: string): Promise<boolean> => {
    const track = await resolveSpotifyTrack(url);
    if (!track) return false;

    setTracks(prev => [track, ...prev]);
    playTrack(track, [track, ...queue]);

    try {
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#1db954', '#10b981', '#ffffff']
      });
    } catch {
      // ignore
    }

    return true;
  };

  const importFullPlaylist = async (input: string): Promise<boolean> => {
    try {
      const result = await parseBulkPlaylistInput(input);
      if (!result || result.tracks.length === 0) return false;

      setTracks(prev => [...result.tracks, ...prev]);
      setPlaylists(prev => [result.playlist, ...prev]);
      setSelectedPlaylistId(result.playlist.id);
      setActiveTab('playlist');
      playTrack(result.tracks[0], result.tracks);

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#fa2d48', '#1db954', '#ef4444', '#8b5cf6', '#ffffff']
        });
      } catch {
        // ignore
      }

      return true;
    } catch (e) {
      console.error('Failed to bulk import playlist:', e);
      return false;
    }
  };

  // =========================================================================
  // 1. Full navigator.mediaSession Hardware Bridge & Lockscreen Action Handlers
  // =========================================================================
  // Register high-res square artwork and track metadata
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator) || !currentTrack) return;

    try {
      const artworkUrl = get4kArtworkUrl(currentTrack);

      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentTrack.title,
        artist: currentTrack.artist,
        album: currentTrack.album || 'Aura Music',
        artwork: [
          { src: artworkUrl, sizes: '96x96', type: 'image/jpeg' },
          { src: artworkUrl, sizes: '128x128', type: 'image/jpeg' },
          { src: artworkUrl, sizes: '192x192', type: 'image/jpeg' },
          { src: artworkUrl, sizes: '256x256', type: 'image/jpeg' },
          { src: artworkUrl, sizes: '384x384', type: 'image/jpeg' },
          { src: artworkUrl, sizes: '512x512', type: 'image/jpeg' }
        ]
      });

      syncMediaSessionPositionState();
    } catch (err) {
      console.warn('[MediaSession] Metadata registration error:', err);
    }
  }, [currentTrack, syncMediaSessionPositionState]);

  // Bind Hardware & Lockscreen Action Handlers (play, pause, previoustrack, nexttrack, seekto, seekforward, seekbackward)
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;

    try {
      navigator.mediaSession.setActionHandler('play', () => {
        if (!isPlayingRef.current) togglePlay();
        syncMediaSessionPositionState(currentTimeRef.current, durationRef.current, playbackSpeedRef.current, true);
      });

      navigator.mediaSession.setActionHandler('pause', () => {
        if (isPlayingRef.current) togglePlay();
        syncMediaSessionPositionState(currentTimeRef.current, durationRef.current, playbackSpeedRef.current, false);
      });

      navigator.mediaSession.setActionHandler('previoustrack', () => {
        skipPrev();
      });

      navigator.mediaSession.setActionHandler('nexttrack', () => {
        skipNext();
      });

      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime !== undefined && !isNaN(details.seekTime) && isFinite(details.seekTime)) {
          seek(details.seekTime);
          syncMediaSessionPositionState(details.seekTime, durationRef.current, playbackSpeedRef.current, isPlayingRef.current);
        }
      });

      navigator.mediaSession.setActionHandler('seekbackward', (details) => {
        const offset = details.seekOffset || 10;
        const target = Math.max(0, currentTimeRef.current - offset);
        seek(target);
        syncMediaSessionPositionState(target, durationRef.current, playbackSpeedRef.current, isPlayingRef.current);
      });

      navigator.mediaSession.setActionHandler('seekforward', (details) => {
        const offset = details.seekOffset || 10;
        const target = Math.min(durationRef.current || Infinity, currentTimeRef.current + offset);
        seek(target);
        syncMediaSessionPositionState(target, durationRef.current, playbackSpeedRef.current, isPlayingRef.current);
      });

      navigator.mediaSession.setActionHandler('stop', () => {
        pause();
        syncMediaSessionPositionState(currentTimeRef.current, durationRef.current, playbackSpeedRef.current, false);
      });
    } catch (err) {
      console.warn('[MediaSession] Action handlers registration error:', err);
    }
  }, [togglePlay, skipNext, skipPrev, seek, pause, syncMediaSessionPositionState]);

  // Periodic synchronization of playbackState & positionState with Hardware Audio Engine
  useEffect(() => {
    syncMediaSessionPositionState(currentTime, duration, playbackSpeed, isPlaying);
  }, [isPlaying, currentTime, duration, playbackSpeed, syncMediaSessionPositionState]);

  // =========================================================================
  // 2. Picture-in-Picture Floating Dynamic Island Synchronization
  // =========================================================================
  useEffect(() => {
    pipIslandController.init({
      onTogglePlay: () => togglePlay(),
      onNext: () => skipNext(),
      onPrev: () => skipPrev(),
      onSeek: (t) => seek(t),
    });
  }, [togglePlay, skipNext, skipPrev, seek]);

  useEffect(() => {
    const dominantColor = currentTrack?.dominantColor || activeThemeColor || '#fa2d48';
    pipIslandController.updateState({
      track: currentTrack,
      isPlaying,
      currentTime,
      duration,
      primaryColor: dominantColor,
    });
  }, [currentTrack, isPlaying, currentTime, duration, activeThemeColor]);

  // =========================================================================
  // 3. Screen Wake Lock & Background Audio Keep-Alive + Auto PiP on Minimize
  // =========================================================================
  useEffect(() => {
    let wakeLock: any = null;

    const requestWakeLock = async () => {
      if (typeof navigator !== 'undefined' && 'wakeLock' in navigator && isPlaying && document.visibilityState === 'visible') {
        try {
          wakeLock = await (navigator as any).wakeLock.request('screen');
        } catch {
          // ignore
        }
      }
    };

    const releaseWakeLock = () => {
      if (wakeLock) {
        try {
          wakeLock.release();
        } catch {
          // ignore
        }
        wakeLock = null;
      }
    };

    if (isPlaying) {
      requestWakeLock();
    } else {
      releaseWakeLock();
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // App is minimized or tab switched:
        // 1. Keep background audio pipelines alive
        if (isPlayingRef.current) {
          // Immediately sync native MediaStyle notification & system live status capsule
          syncMediaSessionPositionState(currentTimeRef.current, durationRef.current, playbackSpeedRef.current, true);
          if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
            audioContextRef.current.resume().catch(() => {});
          }
          if (audioRef.current && audioRef.current.paused) {
            audioRef.current.play().catch(() => {});
          }
          // 2. Automatically spawn the persistent floating canvas PiP window (300px × 80px)
          if (currentTrackRef.current && !pipIslandController.isPipActive()) {
            pipIslandController.requestPipIsland().catch((err) => {
              console.log('[PiP] Auto PiP trigger on hidden error:', err);
            });
          }
        }
      } else {
        // App returned to foreground
        if (isPlayingRef.current) {
          requestWakeLock();
          if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
            audioContextRef.current.resume().catch(() => {});
          }
        }
      }
    };

    const handleWindowBlur = () => {
      if (isPlayingRef.current && audioContextRef.current && audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume().catch(() => {});
      }
    };

    const handleWindowFocus = () => {
      if (isPlayingRef.current) {
        requestWakeLock();
        if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
          audioContextRef.current.resume().catch(() => {});
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
      releaseWakeLock();
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'ArrowRight') {
        seek(currentTime + 5);
      } else if (e.code === 'ArrowLeft') {
        seek(currentTime - 5);
      } else if (e.code === 'ArrowUp') {
        e.preventDefault();
        setVolume(volume + 0.05);
      } else if (e.code === 'ArrowDown') {
        e.preventDefault();
        setVolume(volume - 0.05);
      } else if (e.key === 'm' || e.key === 'M') {
        toggleMute();
      } else if (e.key === 'l' || e.key === 'L') {
        setIsLyricsOpen(prev => !prev);
      } else if (e.key === 'f' || e.key === 'F') {
        setIsFullscreen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentTime, duration, isPlaying, volume, isMuted]);

  // Library Backup Export & Restore
  const exportLibraryData = (): string => {
    const data = {
      version: '2.5.0',
      exportedAt: new Date().toISOString(),
      favorites,
      playlists: playlists.filter(p => p.isCustom),
      settings,
      soundQualityMode,
      selectedAutoEQ
    };
    return JSON.stringify(data, null, 2);
  };

  const importLibraryData = (jsonData: string): boolean => {
    try {
      const data = JSON.parse(jsonData);
      if (Array.isArray(data.favorites)) {
        setFavorites(data.favorites);
        localStorage.setItem('aura_favorites', JSON.stringify(data.favorites));
      }
      if (Array.isArray(data.playlists)) {
        setPlaylists(prev => {
          const builtin = prev.filter(p => !p.isCustom);
          const merged = [...builtin, ...data.playlists];
          localStorage.setItem('aura_playlists', JSON.stringify(merged));
          return merged;
        });
      }
      if (data.settings && typeof data.settings === 'object') {
        updateSettings(data.settings);
      }
      return true;
    } catch (e) {
      console.error('Import library data error:', e);
      return false;
    }
  };

  return (
    <AudioContext.Provider
      value={{
        currentTrack,
        isPlaying,
        currentTime,
        duration,
        volume,
        isMuted,
        buffered,
        repeatMode,
        isShuffled,
        tracks,
        localTracks,
        youtubeTracks,
        playlists,
        favorites,
        trackRegistry,
        recentlyPlayed,
        clearRecentlyPlayed,
        activeTab,
        setActiveTab,
        selectedPlaylistId,
        setSelectedPlaylistId,
        searchQuery,
        setSearchQuery,
        settings,
        updateSettings,
        soundQualityMode,
        setSoundQualityMode,
        vocalReductionLevel,
        setVocalReductionLevel,
        spatialRoom,
        setSpatialRoom,
        tubeWarmth,
        setTubeWarmth,
        visualizerMode,
        setVisualizerMode,
        playbackSpeed,
        setPlaybackSpeed,
        sleepTimerMinutes,
        sleepTimerRemaining,
        setSleepTimer,
        selectedAutoEQ,
        setAutoEQ,
        fetchLyricsFromLrclib,
        isLyricsOpen,
        setIsLyricsOpen,
        isQueueOpen,
        setIsQueueOpen,
        isEqualizerOpen,
        setIsEqualizerOpen,
        isAudioQualityModalOpen,
        setIsAudioQualityModalOpen,
        isFullscreen,
        setIsFullscreen,
        isIslandActive,
        setIsIslandActive,
        minimizeToIsland,
        dismissIsland,
        isCreatePlaylistOpen,
        setIsCreatePlaylistOpen,
        isVideoModalOpen,
        setIsVideoModalOpen,
        isVideoPlaying,
        setIsVideoPlaying,
        pauseAudioForVideo,
        resumeAudioAfterVideo,
        queue,
        queueIndex,
        playTrack,
        togglePlay,
        pause,
        resume,
        seek,
        setVolume,
        toggleMute,
        skipNext,
        skipPrev,
        toggleShuffle,
        cycleRepeatMode,
        addToQueue,
        playNext,
        removeFromQueue,
        clearQueue,
        equalizerPreset,
        setEqualizerPreset,
        eqGains,
        setEqBandGain,
        analyserNode,
        toggleFavorite,
        isFavorite,
        createPlaylist,
        addTrackToPlaylist,
        removeTrackFromPlaylist,
        importLocalFiles,
        importFromYouTube,
        importFromSpotify,
        importFullPlaylist,
        searchOnline,
        activeThemeColor,
        exportLibraryData,
        importLibraryData,
        requestPipIsland: () => pipIslandController.requestPipIsland(),
        exitPipIsland: () => pipIslandController.exitPipIsland(),
        isPipActive: () => pipIslandController.isPipActive(),
        updateInfo,
        setUpdateInfo,
        isUpdateModalOpen,
        setIsUpdateModalOpen,
        checkUpdates,
        isCheckingUpdate,
      }}
    >
      {children}
      <audio
        ref={audioRef}
        crossOrigin="anonymous"
        playsInline
        preload="metadata"
        className="hidden"
      />
      <audio
        ref={crossfadeAudioRef}
        crossOrigin="anonymous"
        playsInline
        preload="auto"
        className="hidden"
      />
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};
