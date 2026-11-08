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
import { getApiUrl } from '../utils/apiConfig';

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
}

const AudioContext = createContext<AudioContextType | null>(null);

const EQ_PRESET_GAINS: Record<EqualizerPreset, number[]> = {
  'flat': [0, 0, 0, 0, 0],
  'bass-boost': [7, 4, 1, 0, 0],
  'acoustic': [3, -1, 2, 4, 3],
  'electronic': [6, 3, 0, 3, 5],
  'vocal-booster': [-2, 0, 4, 5, 2],
  'rock': [5, 2, -2, 3, 6],
};

const FREQUENCIES = [60, 250, 1000, 4000, 12000];

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
  const [equalizerPreset, setEqualizerPreset] = useState<EqualizerPreset>('flat');
  const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(null);

  // Audio Engine & DSP Refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const eqFiltersRef = useRef<BiquadFilterNode[]>([]);
  const dspEngineRef = useRef<AudioDSPEngine>(new AudioDSPEngine());

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
            let currentVol = audioRef.current.volume;
            const fadeInterval = setInterval(() => {
              currentVol = Math.max(0, currentVol - 0.1);
              if (audioRef.current) audioRef.current.volume = currentVol;
              if (currentVol <= 0) {
                clearInterval(fadeInterval);
                audioRef.current?.pause();
                setIsPlaying(false);
              }
            }, 200);
          } else {
            setIsPlaying(false);
          }
          setSleepTimerMinutes(null);
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [sleepTimerRemaining]);

  const setSleepTimer = (minutes: number | null) => {
    setSleepTimerMinutes(minutes);
    setSleepTimerRemaining(minutes ? minutes * 60 : null);
  };

  // Set Playback Speed (Tempo Control from LastWave)
  const setPlaybackSpeed = (speed: number) => {
    const clamped = Math.max(0.5, Math.min(2.0, speed));
    setPlaybackSpeedState(clamped);
    youtubeEngine.setPlaybackRate(clamped);
    if (audioRef.current) {
      audioRef.current.playbackRate = clamped;
    }
  };

  // Set AutoEQ Profile (Headphone Calibration from LastWave)
  const setAutoEQ = (profileId: string | null) => {
    setSelectedAutoEQ(profileId);
    if (!profileId) {
      // Revert to current equalizerPreset
      const gains = EQ_PRESET_GAINS[equalizerPreset];
      eqFiltersRef.current.forEach((filter, index) => {
        filter.gain.setTargetAtTime(gains[index], audioContextRef.current?.currentTime || 0, 0.05);
      });
      return;
    }

    const profile = AUTO_EQ_PROFILES.find(p => p.id === profileId);
    if (profile && eqFiltersRef.current.length === 5) {
      eqFiltersRef.current.forEach((filter, index) => {
        filter.gain.setTargetAtTime(profile.gains[index], audioContextRef.current?.currentTime || 0, 0.05);
      });
    }
  };

  // Online YouTube Music search helper (with regional localization support)
  const searchOnline = async (query: string): Promise<Track[]> => {
    if (!query.trim()) return [];
    try {
      const regionParam = encodeURIComponent(settings.contentRegion || 'GLOBAL');
      const res = await fetch(getApiUrl(`/api/search?q=${encodeURIComponent(query.trim())}&region=${regionParam}`));
      if (res.ok) {
        const data = await res.json();
        if (data.tracks && data.tracks.length > 0) {
          data.tracks.forEach((t: Track) => registerTrack(t));
          return data.tracks;
        }
      }
    } catch (err) {
      console.warn('Online search fetch failed:', err);
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

  // Initialize Audio Element and Web Audio API
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    (window as any).__audio = audio;

    // Set initial track source so bottom player is immediately ready on first click
    if (INITIAL_TRACKS[0]?.youtubeId) {
      audio.src = getApiUrl(`/api/stream?id=${INITIAL_TRACKS[0].youtubeId}`);
    }

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (audio.buffered.length > 0) {
        const bufferedEnd = audio.buffered.end(audio.buffered.length - 1);
        const dur = audio.duration || 1;
        setBuffered(Math.min((bufferedEnd / dur) * 100, 100));
      }
    };

    const handleLoadedMetadata = () => {
      console.log('[AUDIO] loadedmetadata, duration:', audio.duration);
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration);
      }
    };

    const handlePlay = () => {
      console.log('[AUDIO] play event fired');
      setIsPlaying(true);
    };
    const handlePause = () => {
      console.log('[AUDIO] pause event fired');
      setIsPlaying(false);
    };
    const handleWaiting = () => {
      console.log('[AUDIO] waiting event fired');
      setBuffered(25);
    };
    const handlePlaying = () => {
      console.log('[AUDIO] playing event fired, currentTime:', audio.currentTime);
      setIsPlaying(true);
      setBuffered(100);
    };
    const handleError = () => {
      const err = audio.error;
      console.error('[AUDIO] error event fired! Code:', err?.code, 'Message:', err?.message, 'src:', audio.src);
      setIsPlaying(false);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('playing', handlePlaying);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('playing', handlePlaying);
      audio.removeEventListener('error', handleError);
      audio.pause();
    };
  }, []);

  // Web Audio Context initialization on first interaction
  const initWebAudio = useCallback(() => {
    if (!audioRef.current || audioContextRef.current) return;

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

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

      // Web Audio DSP setup (keep optional so native hardware output is never blocked)
      /*
      try {
        const source = ctx.createMediaElementSource(audioRef.current);
        sourceNodeRef.current = source;

        let prevNode: AudioNode = source;
        for (const filter of filters) {
          prevNode.connect(filter);
          prevNode = filter;
        }
        prevNode.connect(analyser);

        dspEngineRef.current.init(ctx, analyser, ctx.destination);
        dspEngineRef.current.setMode(soundQualityMode);
      } catch (sourceErr) {
        console.warn('Web Audio bypass:', sourceErr);
      }
      */
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
      const gains = EQ_PRESET_GAINS[equalizerPreset];
      eqFiltersRef.current.forEach((filter, index) => {
        filter.gain.setTargetAtTime(gains[index], audioContextRef.current?.currentTime || 0, 0.05);
      });
    }
  }, [equalizerPreset, selectedAutoEQ]);

  const setVolume = (val: number) => {
    const clamped = Math.max(0, Math.min(1, val));
    setVolumeState(clamped);
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : clamped;
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
      setIsMuted(false);
    } else {
      if (audioRef.current) {
        audioRef.current.volume = 0;
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
      fetch(getApiUrl(`/api/search?q=${encodeURIComponent(cleanArt + ' songs')}`))
        .then(r => r.json())
        .then(data => {
          if (data && Array.isArray(data.tracks) && data.tracks.length > 0) {
            data.tracks.forEach((t: Track) => registerTrack(t));
          }
        })
        .catch(() => {});
    }

    // Unified Native HTML5 Audio Streaming for all online and local tracks
    const audio = audioRef.current;
    if (audio) {
      const streamSrc = track.youtubeId
        ? getApiUrl(`/api/stream?id=${track.youtubeId}`)
        : (track.audioUrl || (track.id.startsWith('yt-') ? getApiUrl(`/api/stream?id=${track.id.replace('yt-', '')}`) : ''));

      const fullStreamSrc = streamSrc.startsWith('http') ? streamSrc : `${window.location.origin}${streamSrc}`;

      if (audio.src !== fullStreamSrc && audio.src !== streamSrc) {
        audio.src = streamSrc;
      }
      audio.playbackRate = playbackSpeed;
      audio.volume = isMuted ? 0 : volume;

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          setIsPlaying(true);
        }).catch((err) => {
          console.warn('[Audio] Playback gesture failed or autoplay policy:', err);
          setIsPlaying(false);
        });
      } else {
        setIsPlaying(true);
      }
    }
  }, [initWebAudio, queue, playbackSpeed, isMuted, volume]);

  const skipNext = useCallback(() => {
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
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      if (repeatMode === 'one') {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      } else {
        skipNext();
      }
    };

    audio.addEventListener('ended', handleEnded);
    return () => {
      audio.removeEventListener('ended', handleEnded);
    };
  }, [repeatMode, skipNext]);

  // MediaSession API for mobile lockscreen and notification drawer playback controls
  useEffect(() => {
    if ('mediaSession' in navigator && currentTrack) {
      try {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: currentTrack.title,
          artist: currentTrack.artist,
          album: currentTrack.album,
          artwork: [
            { src: currentTrack.coverUrl, sizes: '512x512', type: 'image/jpeg' },
            { src: currentTrack.coverUrl, sizes: '256x256', type: 'image/jpeg' }
          ]
        });

        navigator.mediaSession.setActionHandler('play', () => {
          audioRef.current?.play().catch(() => {});
        });
        navigator.mediaSession.setActionHandler('pause', () => {
          audioRef.current?.pause();
        });
        navigator.mediaSession.setActionHandler('previoustrack', () => {
          skipPrev();
        });
        navigator.mediaSession.setActionHandler('nexttrack', () => {
          skipNext();
        });
        navigator.mediaSession.setActionHandler('seekto', (details) => {
          if (details.seekTime !== undefined && audioRef.current) {
            audioRef.current.currentTime = details.seekTime;
            setCurrentTime(details.seekTime);
          }
        });
      } catch (err) {
        console.warn('MediaSession error:', err);
      }
    }
  }, [currentTrack, skipPrev, skipNext]);

  const togglePlay = () => {
    initWebAudio();
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume().catch(() => {});
    }

    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      if ((!audio.src || audio.src === window.location.href) && currentTrack) {
        const streamSrc = currentTrack.youtubeId
          ? getApiUrl(`/api/stream?id=${currentTrack.youtubeId}`)
          : (currentTrack.audioUrl || (currentTrack.id.startsWith('yt-') ? getApiUrl(`/api/stream?id=${currentTrack.id.replace('yt-', '')}`) : ''));
        audio.src = streamSrc;
      }
      audio.playbackRate = playbackSpeed;
      audio.volume = isMuted ? 0 : volume;
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          setIsPlaying(true);
        }).catch(e => {
          console.warn('[Audio] togglePlay error:', e);
          setIsPlaying(false);
        });
      } else {
        setIsPlaying(true);
      }
    }
  };

  const pause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
  };

  const resume = () => {
    initWebAudio();
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    if (audioRef.current) {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {});
    }
  };

  const seek = (seconds: number) => {
    const clamped = Math.max(0, Math.min(seconds, duration || seconds));
    setCurrentTime(clamped);
    if (audioRef.current) {
      audioRef.current.currentTime = clamped;
    }
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

  useEffect(() => {
    if (!('mediaSession' in navigator) || !currentTrack) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentTrack.title,
      artist: currentTrack.artist,
      album: currentTrack.album,
      artwork: [
        { src: currentTrack.coverUrl, sizes: '512x512', type: 'image/jpeg' },
        { src: currentTrack.coverUrl, sizes: '256x256', type: 'image/jpeg' }
      ]
    });

    navigator.mediaSession.setActionHandler('play', () => {
      audioRef.current?.play().catch(() => {});
    });
    navigator.mediaSession.setActionHandler('pause', () => {
      audioRef.current?.pause();
    });
    navigator.mediaSession.setActionHandler('previoustrack', () => {
      skipPrev();
    });
    navigator.mediaSession.setActionHandler('nexttrack', () => {
      skipNext();
    });
    navigator.mediaSession.setActionHandler('seekto', (details) => {
      if (details.seekTime !== undefined) {
        seek(details.seekTime);
      }
    });

    return () => {
      try {
        navigator.mediaSession.setActionHandler('play', null);
        navigator.mediaSession.setActionHandler('pause', null);
        navigator.mediaSession.setActionHandler('previoustrack', null);
        navigator.mediaSession.setActionHandler('nexttrack', null);
        navigator.mediaSession.setActionHandler('seekto', null);
      } catch {
        // ignore
      }
    };
  }, [currentTrack, skipNext, skipPrev]);

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
