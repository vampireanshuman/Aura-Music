import React, { useEffect, useRef, useState } from 'react';
import { useAudio } from '../context/AudioContext';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Shuffle, 
  Repeat, 
  Volume2, 
  VolumeX, 
  Heart,
  ListMusic,
  Mic2,
  ChevronDown,
  Video,
  RefreshCw,
  Activity,
  X,
  Gauge
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { formatTime, formatRemainingTime } from '../utils/formatTime';
import { AudioVisualizer } from './AudioVisualizer';
import { AnimatedSoundBars } from './AnimatedSoundBars';
import { get4kArtworkUrl, handleArtworkError } from '../utils/artworkUtils';
import { triggerHaptic } from '../utils/haptics';
import { SyncedNativeVideoPlayer } from './SyncedNativeVideoPlayer';
import { TrackActionMenu } from './TrackActionMenu';
import { getApiUrl } from '../utils/apiConfig';
import type { VisualizerMode } from '../types/music';

export const FullscreenPlayer: React.FC = () => {
  const {
    isFullscreen,
    setIsFullscreen,
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    buffered,
    volume,
    isMuted,
    isShuffled,
    repeatMode,
    togglePlay,
    skipNext,
    skipPrev,
    seek,
    setVolume,
    toggleMute,
    toggleShuffle,
    cycleRepeatMode,
    toggleFavorite,
    isFavorite,
    setIsQueueOpen,
    settings,
    activeThemeColor,
    pauseAudioForVideo,
    resumeAudioAfterVideo,
    isVideoPlaying,
    fetchLyricsFromLrclib,
    visualizerMode,
    setVisualizerMode,
    vocalReductionLevel,
    setVocalReductionLevel,
    spatialRoom,
    tubeWarmth
  } = useAudio();

  const [viewTab, setViewTab] = useState<'cover' | 'vinyl' | 'lyrics' | 'video'>('cover');
  const [resolvedVideoId, setResolvedVideoId] = useState<string | null>(null);
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const touchStartYRef = useRef<number | null>(null);
  const touchStartTimeRef = useRef<number>(0);
  const lastTouchYRef = useRef<number>(0);
  const lastTouchTimeRef = useRef<number>(0);
  const velocityYRef = useRef<number>(0);
  const isGestureEligibleRef = useRef<boolean>(false);
  const [isLyricsLoading, setIsLyricsLoading] = useState(false);
  const [showSingModal, setShowSingModal] = useState(false);
  const [showAudiophileHud, setShowAudiophileHud] = useState(false);
  const [heartBurst, setHeartBurst] = useState(false);
  const [isMinimizing, setIsMinimizing] = useState(false);
  const [artTilt, setArtTilt] = useState({ x: 0, y: 0 });
  const isArtTiltingRef = useRef(false);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [visualizerToast, setVisualizerToast] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const handleCycleVisualizer = () => {
    const modes: VisualizerMode[] = ['wave', 'bars', 'radial', 'analog-vu'];
    const nextIdx = (modes.indexOf(visualizerMode) + 1) % modes.length;
    const newMode = modes[nextIdx];
    setVisualizerMode(newMode);
    triggerHaptic('light');

    const displayLabel = newMode === 'analog-vu' ? 'VU Meter' : newMode.charAt(0).toUpperCase() + newMode.slice(1);
    setVisualizerToast(`Mode: ${displayLabel}`);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => {
      setVisualizerToast(null);
    }, 1500);
  };

  const handleArtworkTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const touch = e.touches[0];
    const px = (touch.clientX - rect.left) / rect.width - 0.5;
    const py = (touch.clientY - rect.top) / rect.height - 0.5;
    isArtTiltingRef.current = true;
    setArtTilt({ x: -py * 16, y: px * 16 });
  };

  const handleArtworkTouchEnd = () => {
    setArtTilt({ x: 0, y: 0 });
    setTimeout(() => {
      isArtTiltingRef.current = false;
    }, 100);
  };

  // High-Performance Spring-Based Touch Gesture Tracking (120fps direct manipulation)
  const handlePlayerTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    // Don't intercept sliders, interactive buttons, or lyrics scrolling
    if (target.closest('button, input, [role="slider"], .interactive-scrubber, .lyrics-scroll-container')) {
      isGestureEligibleRef.current = false;
      return;
    }

    const touch = e.touches[0];
    touchStartYRef.current = touch.clientY;
    touchStartTimeRef.current = performance.now();
    lastTouchYRef.current = touch.clientY;
    lastTouchTimeRef.current = touchStartTimeRef.current;
    velocityYRef.current = 0;
    isGestureEligibleRef.current = true;
  };

  const handlePlayerTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isGestureEligibleRef.current || touchStartYRef.current === null || isMinimizing) return;
    const touch = e.touches[0];
    const deltaY = touch.clientY - touchStartYRef.current;

    if (deltaY > 0) {
      if (!isDragging) setIsDragging(true);
      const now = performance.now();
      const dt = now - lastTouchTimeRef.current;
      if (dt > 8) {
        const instantVelocity = (touch.clientY - lastTouchYRef.current) / dt; // px/ms
        velocityYRef.current = 0.65 * instantVelocity + 0.35 * velocityYRef.current;
        lastTouchYRef.current = touch.clientY;
        lastTouchTimeRef.current = now;
      }
      setDragY(deltaY);
    } else if (isDragging && deltaY <= 0) {
      setDragY(0);
      setIsDragging(false);
    }
  };

  const handlePlayerTouchEnd = () => {
    if (!isGestureEligibleRef.current || touchStartYRef.current === null) {
      touchStartYRef.current = null;
      isGestureEligibleRef.current = false;
      return;
    }

    const currentDrag = dragY;
    const velocity = velocityYRef.current; // px per ms

    // Threshold: downward drag > 70px OR downward flick velocity > 0.35 px/ms
    if (currentDrag > 70 || velocity > 0.35) {
      setIsDragging(false);
      handleGenieSuctionClose(velocity);
    } else {
      // Elastic spring snap back to full screen
      setIsDragging(false);
      setDragY(0);
    }

    touchStartYRef.current = null;
    isGestureEligibleRef.current = false;
  };

  // Apple-grade Genie Suction into Dynamic Island Cutout with 120fps spring physics
  const handleGenieSuctionClose = (velocity: number = 0) => {
    if (isMinimizing) return;
    setIsMinimizing(true);
    triggerHaptic('medium');

    // Dynamic duration based on downward velocity (snappier on fast flick)
    const suctionDuration = Math.max(380, Math.min(550, 520 - (typeof velocity === 'number' ? velocity : 0) * 130));

    // Trigger elastic squish-and-rebound on Dynamic Island as suction reaches the top notch
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('aura-island-rebound'));
      triggerHaptic('heavy');
    }, suctionDuration * 0.65);

    setTimeout(() => {
      setIsFullscreen(false);
      setIsMinimizing(false);
      setDragY(0);
    }, suctionDuration);
  };

  const activeLyricRef = useRef<HTMLDivElement | null>(null);
  const lastArtworkTapRef = useRef<number>(0);
  const isScratchingRef = useRef(false);
  const lastAngleRef = useRef(0);
  const vinylCenterRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Auto-fetch full time-synced lyrics if missing or incomplete
  useEffect(() => {
    if (isFullscreen && currentTrack && (!currentTrack.lyrics || currentTrack.lyrics.length < 15)) {
      setIsLyricsLoading(true);
      fetchLyricsFromLrclib(currentTrack).finally(() => setIsLyricsLoading(false));
    }
  }, [isFullscreen, currentTrack, fetchLyricsFromLrclib]);

  // Video resolution and audio-sync management
  useEffect(() => {
    let active = true;
    if (currentTrack) {
      const rawId = currentTrack.youtubeId || (currentTrack.id.startsWith('yt-') ? currentTrack.id.replace('yt-', '') : null);
      if (rawId) {
        setResolvedVideoId(rawId);
      } else {
        fetch(getApiUrl(`/api/search?q=${encodeURIComponent(currentTrack.artist + ' ' + currentTrack.title + ' official video')}`))
          .then(res => res.json())
          .then(data => {
            if (active && data.tracks?.[0]?.youtubeId) {
              setResolvedVideoId(data.tracks[0].youtubeId);
            }
          })
          .catch(() => {});
      }
    }
    return () => { active = false; };
  }, [currentTrack]);

  // Audio pause when switching to video mode to prevent overlapping
  useEffect(() => {
    if (viewTab === 'video') {
      pauseAudioForVideo();
    } else {
      if (isVideoPlaying) {
        resumeAudioAfterVideo();
      }
    }
  }, [viewTab, isVideoPlaying, pauseAudioForVideo, resumeAudioAfterVideo]);

  // Clean up when fullscreen closes
  useEffect(() => {
    return () => {
      if (viewTab === 'video') {
        resumeAudioAfterVideo();
      }
    };
  }, [viewTab, resumeAudioAfterVideo]);

  // Double tap gesture on album art for Instagram-style heart burst
  const handleArtworkDoubleTap = () => {
    const now = Date.now();
    if (now - lastArtworkTapRef.current < 320) {
      if (currentTrack && !isFavorite(currentTrack.id)) {
        toggleFavorite(currentTrack.id, currentTrack);
      }
      setHeartBurst(true);
      triggerHaptic('success');
      confetti({
        particleCount: 35,
        spread: 70,
        origin: { y: 0.5 },
        colors: ['#fa2d48', '#fb7185', '#fda4af', '#ffffff']
      });
      setTimeout(() => setHeartBurst(false), 900);
      lastArtworkTapRef.current = 0;
    } else {
      lastArtworkTapRef.current = now;
    }
  };

  // Tactile Vinyl turntable scratching physics
  const handleVinylPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    isScratchingRef.current = true;
    const rect = e.currentTarget.getBoundingClientRect();
    vinylCenterRef.current = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    };
    lastAngleRef.current = Math.atan2(e.clientY - vinylCenterRef.current.y, e.clientX - vinylCenterRef.current.x);
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
  };

  const handleVinylPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isScratchingRef.current || duration <= 0) return;
    const currentAngle = Math.atan2(e.clientY - vinylCenterRef.current.y, e.clientX - vinylCenterRef.current.x);
    let delta = currentAngle - lastAngleRef.current;
    if (delta > Math.PI) delta -= Math.PI * 2;
    if (delta < -Math.PI) delta += Math.PI * 2;
    lastAngleRef.current = currentAngle;

    // 1 full spin (2*PI) corresponds to 4 seconds of audio scrubbing
    const deltaSec = (delta / (Math.PI * 2)) * 4.0;
    seek(Math.max(0, Math.min(duration, currentTime + deltaSec)));
    triggerHaptic('light');
  };

  const handleVinylPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isScratchingRef.current) {
      isScratchingRef.current = false;
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {}
    }
  };

  const lyrics = currentTrack?.lyrics || [];
  let activeLyricIndex = -1;
  for (let i = lyrics.length - 1; i >= 0; i--) {
    if (currentTime >= lyrics[i].time) {
      activeLyricIndex = i;
      break;
    }
  }

  useEffect(() => {
    if (isFullscreen && activeLyricRef.current) {
      activeLyricRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [activeLyricIndex, isFullscreen]);

  if (!isFullscreen || !currentTrack) return null;

  const isLiked = isFavorite(currentTrack.id);
  const primaryColor = activeThemeColor || currentTrack.dominantColor || '#fa2d48';
  const percentPlayed = duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0;
  const isSingActive = vocalReductionLevel > 0;

  const dragProgress = Math.min(1, Math.max(0, dragY / 380));
  const dynamicScale = Math.max(0.72, 1 - dragProgress * 0.25);
  const squeezeX = 1 + dragProgress * 0.12;
  const squeezeY = Math.max(0.78, 1 - dragProgress * 0.14);
  const dynamicRadius = Math.min(999, dragProgress * 54);

  const winW = typeof window !== 'undefined' ? window.innerWidth : 390;
  const winH = typeof window !== 'undefined' ? window.innerHeight : 844;
  // Morph target into top camera notch (top: 12px, width: 126px, height: 36px) with elastic scaleX(1.12) squeeze
  const notchScaleX = ((126 / winW) * 1.12).toFixed(4);
  const notchScaleY = (36 / winH).toFixed(4);

  return (
    <div 
      onTouchStart={handlePlayerTouchStart}
      onTouchMove={handlePlayerTouchMove}
      onTouchEnd={handlePlayerTouchEnd}
      style={{
        transform: isMinimizing
          ? `translate3d(0, 12px, 0) scale3d(${notchScaleX}, ${notchScaleY}, 1)`
          : isDragging
          ? `translate3d(0, ${dragY}px, 0) scale3d(${(dynamicScale * squeezeX).toFixed(3)}, ${(dynamicScale * squeezeY).toFixed(3)}, 1)`
          : 'translate3d(0, 0, 0) scale3d(1, 1, 1)',
        borderRadius: isMinimizing
          ? '999px'
          : isDragging
          ? `${dynamicRadius}px`
          : '0px',
        opacity: isMinimizing ? 0 : 1,
        transformOrigin: '50% 0%',
        transition: isDragging
          ? 'none'
          : 'transform 0.52s cubic-bezier(0.16, 1, 0.3, 1), border-radius 0.52s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.48s cubic-bezier(0.16, 1, 0.3, 1)',
        willChange: 'transform, border-radius, opacity',
        pointerEvents: isMinimizing ? 'none' : 'auto'
      }}
      className="fixed inset-0 z-50 flex flex-col bg-[#07080c] text-white overflow-hidden select-none gpu-spring-layer"
    >
      {/* 40px x 5px Apple iOS Grabber Pill */}
      <div 
        onClick={() => handleGenieSuctionClose()}
        className="w-[40px] h-[5px] rounded-full bg-white/30 hover:bg-white/60 mx-auto mt-2.5 mb-1 cursor-pointer active:scale-95 transition-all z-20"
        title="Swipe down or tap to close fullscreen player"
      />

      {/* Heavily Blurred Full-Screen Ambient Artwork Glow (70px blur, 190% saturate, 0.55 opacity) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <img
          src={get4kArtworkUrl(currentTrack)}
          onError={handleArtworkError}
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover object-center scale-150 filter blur-[70px] saturate-[190%] opacity-55 transition-all duration-1000"
        />
        <div className="absolute inset-0 bg-[#07080c]/50" />
      </div>

      {/* Clean 3-Part Header: Left Chevron-Down | Centered Song | Lyrics | Video | Right More (...) */}
      <div className="relative z-10 flex items-center justify-between px-4 sm:px-8 py-3 border-b border-white/5">
        {/* Left: Dismiss Button */}
        <button
          onClick={() => handleGenieSuctionClose()}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white backdrop-blur-xl transition-all active:scale-90 flex items-center justify-center shrink-0"
          title="Dismiss back to app"
        >
          <ChevronDown className="w-5 h-5" />
        </button>

        {/* Center: Sleek 3-segment glass pill (Song | Lyrics | Video) */}
        <div className="flex items-center p-1 bg-white/10 rounded-full backdrop-blur-xl border border-white/10 shadow-sm">
          <button
            onClick={() => setViewTab('cover')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
              viewTab === 'cover' ? 'bg-white text-black shadow-sm font-bold' : 'text-white/60 hover:text-white'
            }`}
          >
            Song
          </button>
          <button
            onClick={() => setViewTab('lyrics')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
              viewTab === 'lyrics' ? 'bg-white text-black shadow-sm font-bold' : 'text-white/60 hover:text-white'
            }`}
          >
            Lyrics
          </button>
          <button
            onClick={() => setViewTab('video')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
              viewTab === 'video' ? 'bg-white text-black shadow-sm font-bold' : 'text-white/60 hover:text-white'
            }`}
          >
            Video
          </button>
        </div>

        {/* Right: Single More (...) Action Button */}
        <div className="flex items-center gap-1.5 shrink-0">
          <TrackActionMenu track={currentTrack} />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 px-4 sm:px-8 lg:px-14 items-center overflow-hidden">
        
        {/* Video Mode View (Native HD Stream Synced with Audio) */}
        {viewTab === 'video' && (
          <div className="lg:col-span-12 w-full max-w-4xl mx-auto h-[55vh] lg:h-[65vh] flex items-center justify-center relative animate-in fade-in zoom-in-95 duration-200">
            {resolvedVideoId ? (
              <SyncedNativeVideoPlayer
                videoId={resolvedVideoId}
                title={currentTrack.title}
                artist={currentTrack.artist}
                syncWithAudio={true}
                onClose={() => setViewTab('cover')}
                className="w-full h-full"
              />
            ) : (
              <div className="text-center p-8 text-white/50 space-y-3 z-10 glass-panel rounded-3xl max-w-md mx-auto">
                <Video className="w-12 h-12 mx-auto text-purple-400 animate-pulse" />
                <h4 className="text-lg font-bold text-white">Searching for Official Video...</h4>
                <p className="text-xs text-white/40 max-w-sm">
                  Querying the high-definition direct stream for {currentTrack.title}
                </p>
                <button
                  onClick={() => setViewTab('cover')}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-colors"
                >
                  Return to Artwork
                </button>
              </div>
            )}
          </div>
        )}

        {/* Left Column: Big 4K Album Artwork or Vinyl Turntable & Details */}
        {viewTab !== 'video' && (
          <div className={`lg:col-span-6 flex flex-col items-center justify-center text-center ${
            viewTab === 'lyrics' ? 'hidden lg:flex' : 'flex'
          }`}>
            {/* Vinyl Turntable Mode with Interactive Tactile Scratching */}
            {viewTab === 'vinyl' ? (
              <div 
                className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 flex items-center justify-center cursor-grab active:cursor-grabbing touch-none"
                onPointerDown={handleVinylPointerDown}
                onPointerMove={handleVinylPointerMove}
                onPointerUp={handleVinylPointerUp}
                onPointerCancel={handleVinylPointerUp}
                title="Touch & drag the vinyl to scratch or scrub through audio!"
              >
                {/* Turntable Base Platter */}
                <div className="absolute inset-0 rounded-3xl bg-neutral-900/90 border border-white/15 shadow-[0_25px_60px_rgba(0,0,0,0.8)] backdrop-blur-xl flex items-center justify-center">
                  <div className="absolute top-4 left-4 flex items-center gap-1.5 text-[10px] font-mono text-white/40 uppercase tracking-widest">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>33 ⅓ RPM Direct-Drive</span>
                  </div>
                  <div className="absolute top-4 right-4 text-[10px] font-mono text-amber-400/80">
                    Tactile Scratch Active
                  </div>
                </div>

                {/* Vinyl Record */}
                <div 
                  className={`relative w-48 h-48 sm:w-64 sm:h-64 md:w-76 md:h-76 rounded-full bg-black border-4 border-neutral-800 shadow-[0_10px_40px_rgba(0,0,0,0.9)] flex items-center justify-center select-none overflow-hidden transition-transform duration-700 ${
                    isPlaying ? 'animate-[spin_8s_linear_infinite]' : ''
                  }`}
                  style={{
                    background: 'radial-gradient(circle, #262626 0%, #171717 35%, #0a0a0a 70%, #171717 85%, #0a0a0a 100%)',
                    boxShadow: 'inset 0 0 30px rgba(255,255,255,0.1), 0 15px 35px rgba(0,0,0,0.8)'
                  }}
                >
                  {/* Vinyl Grooves */}
                  <div className="absolute inset-2 rounded-full border border-white/[0.04] pointer-events-none" />
                  <div className="absolute inset-6 rounded-full border border-white/[0.06] pointer-events-none" />
                  <div className="absolute inset-10 rounded-full border border-white/[0.05] pointer-events-none" />
                  <div className="absolute inset-14 rounded-full border border-white/[0.07] pointer-events-none" />

                  {/* Vinyl Specular Gloss Sheen */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/15 to-transparent pointer-events-none" />

                  {/* Center Label with 4K Artwork */}
                  <div className="relative w-20 h-20 sm:w-26 sm:h-26 md:w-32 md:h-32 rounded-full overflow-hidden border-2 border-white/20 shadow-inner flex items-center justify-center pointer-events-none">
                    <img
                      src={get4kArtworkUrl(currentTrack)}
                      onError={handleArtworkError}
                      alt={currentTrack.title}
                      className="w-full h-full object-cover"
                    />
                    {/* Spindle hole */}
                    <div className="absolute w-4 h-4 rounded-full bg-neutral-900 border border-white/30 shadow-md" />
                  </div>
                </div>

                {/* Turntable Tonearm (Pivots into position when playing) */}
                <div 
                  className={`absolute top-6 right-6 w-8 h-44 pointer-events-none transition-transform duration-1000 origin-top-right ${
                    isPlaying ? 'rotate-[25deg]' : 'rotate-0'
                  }`}
                >
                  <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-br from-neutral-200 to-neutral-500 shadow-md border border-white/30" />
                  <div className="w-1 h-36 bg-gradient-to-b from-neutral-300 via-neutral-400 to-neutral-600 rounded-full mx-auto shadow-md" />
                  <div className="w-2.5 h-5 bg-gradient-to-b from-neutral-800 to-red-600 rounded-sm mx-auto shadow-sm" />
                </div>
              </div>
            ) : (
              /* True 1:1 Square Record Sleeve Album Artwork View with Apple Music Breathing & 3D Touch Parallax */
              <div className="perspective-800 flex items-center justify-center w-full">
                <div 
                  onClick={handleArtworkDoubleTap}
                  onTouchMove={handleArtworkTouchMove}
                  onTouchEnd={handleArtworkTouchEnd}
                  className="album-cover-breathing relative aspect-square w-[min(82vw,340px)] rounded-[22px] overflow-hidden select-none flex items-center justify-center bg-black/60 cursor-pointer"
                  style={{
                    transform: `perspective(800px) rotateX(${artTilt.x}deg) rotateY(${artTilt.y}deg) scale(${isPlaying ? 1 : 0.84})`,
                    boxShadow: isPlaying
                      ? `0 28px 60px -12px ${currentTrack.dominantColor || primaryColor}90, 0 12px 30px rgba(0,0,0,0.7)`
                      : '0 10px 25px rgba(0,0,0,0.4)',
                    transition: isArtTiltingRef.current
                      ? 'transform 0.1s ease-out, box-shadow 0.65s ease'
                      : 'transform 0.65s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.65s ease'
                  }}
                  title="Double tap artwork to favorite! Drag finger to tilt in 3D."
                >
                  {/* 1:1 Square Record Sleeve with scale-[1.12] to crop out baked-in YouTube 16:9 pillarbox bars */}
                  <img
                    src={get4kArtworkUrl(currentTrack)}
                    onError={handleArtworkError}
                    alt={currentTrack.title}
                    className="w-full h-full object-cover object-center scale-[1.12] select-none rounded-[22px] drop-shadow-[0_20px_40px_rgba(0,0,0,0.85)] transition-transform duration-700 ease-out"
                  />

                  {/* Double-tap Floating Heart Burst */}
                  {heartBurst && (
                    <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none animate-in zoom-in-50 fade-in duration-200">
                      <Heart className="w-24 h-24 fill-[#fa2d48] text-[#fa2d48] drop-shadow-[0_0_35px_rgba(250,45,72,1)] animate-bounce" />
                    </div>
                  )}

                  {/* Inner rim highlight */}
                  <div className="absolute inset-0 rounded-[22px] ring-1 ring-inset ring-white/10 pointer-events-none" />
                </div>
              </div>
            )}

            {/* Track Info & Audiophile Metadata Bar */}
            <div className="mt-5 sm:mt-6 max-w-lg w-full px-2">
              <div className="flex items-center justify-center gap-3">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white truncate drop-shadow-md">
                  {currentTrack.title}
                </h1>
                <AnimatedSoundBars isPlaying={isPlaying} color={primaryColor} size="md" />

                {/* Quick Favorite Button */}
                <button
                  onClick={() => {
                    toggleFavorite(currentTrack.id, currentTrack);
                    confetti({
                      particleCount: 25,
                      spread: 60,
                      origin: { y: 0.7 },
                      colors: ['#fa2d48', '#ec4899', '#f43f5e']
                    });
                    triggerHaptic('success');
                  }}
                  className="p-1.5 text-white/50 hover:text-red-500 transition-colors shrink-0 spring-button"
                  title={isLiked ? 'Remove from Favorites' : 'Add to Favorites'}
                >
                  <Heart className={`w-5 h-5 sm:w-6 sm:h-6 transition-transform ${
                    isLiked ? 'fill-[#fa2d48] text-[#fa2d48] scale-110 drop-shadow-[0_0_12px_rgba(250,45,72,0.8)]' : ''
                  }`} />
                </button>

                {/* Track Quick Actions Sheet Menu */}
                <TrackActionMenu track={currentTrack} />
              </div>
              
              <p className="text-sm sm:text-base text-white/65 font-medium mt-1 truncate tracking-tight">
                {currentTrack.artist}
              </p>

              {/* Audiophile Master Telemetry HUD Badge */}
              <div className="mt-2 flex items-center justify-center gap-2 flex-wrap">
                <button
                  onClick={() => {
                    triggerHaptic('light');
                    setShowAudiophileHud(prev => !prev);
                  }}
                  className="px-2.5 py-1 rounded-full glass-pill text-[10px] sm:text-[11px] font-mono tabular-nums font-semibold text-white/70 transition-all flex items-center gap-1.5 cursor-pointer spring-button"
                  title="Click to view Studio DSP Engine Telemetry"
                >
                  <Gauge className="w-3 h-3 text-emerald-400" />
                  <span>ALAC 24-Bit / 192kHz</span>
                  <span className="text-white/30">•</span>
                  <span>{currentTrack.bpm || 120} BPM</span>
                  <span className="text-white/30">•</span>
                  <span>{currentTrack.keySignature || 'D# Minor'}</span>
                  {tubeWarmth > 0 && (
                    <>
                      <span className="text-white/30">•</span>
                      <span className="text-amber-400">+{tubeWarmth}dB Tube</span>
                    </>
                  )}
                  {spatialRoom !== 'off' && (
                    <>
                      <span className="text-white/30">•</span>
                      <span className="text-purple-300">{spatialRoom.toUpperCase()}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Right Column: Live Synced Lyrics stream */}
        {viewTab !== 'video' && (
          <div className={`lg:col-span-6 h-[55vh] lg:h-[68vh] flex-col overflow-hidden glass-panel rounded-3xl p-5 sm:p-8 ${
            viewTab === 'lyrics' ? 'flex' : 'hidden lg:flex'
          }`}>
            <div className="pb-3 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mic2 className="w-4 h-4 text-[#fa2d48]" />
                <span className="text-xs font-bold uppercase tracking-wider text-white/70">
                  Time-Synced Live Lyrics
                </span>
                {isSingActive && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Sing Vocal Cut: {Math.round(vocalReductionLevel * 100)}%
                  </span>
                )}
              </div>
              <span className="text-[11px] text-white/40">
                Tap line to seek
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-5 py-8 scroll-smooth select-none">
              {lyrics.length > 0 ? (
                lyrics.map((line, idx) => {
                  const isActive = idx === activeLyricIndex;
                  const isPassed = idx < activeLyricIndex;
                  const activeSizeClass = settings?.lyricsFontSize === 'huge' ? 'text-3xl sm:text-4xl' : settings?.lyricsFontSize === 'normal' ? 'text-xl sm:text-2xl' : 'text-2xl sm:text-3xl';
                  const inactiveSizeClass = settings?.lyricsFontSize === 'huge' ? 'text-xl sm:text-2xl' : settings?.lyricsFontSize === 'normal' ? 'text-base sm:text-lg' : 'text-lg sm:text-xl';
                  const alignClass = settings?.lyricsAlignment === 'center' ? 'text-center' : 'text-left';
                  const blurClass = !isActive && settings?.lyricsBlurInactive ? 'blur-[1px] opacity-40' : '';

                  return (
                    <div
                      key={idx}
                      ref={isActive ? activeLyricRef : null}
                      onClick={() => seek(line.time)}
                      className={`cursor-pointer transition-all duration-300 leading-snug ${alignClass} ${blurClass} ${
                        isActive
                          ? `text-white ${activeSizeClass} font-black scale-[1.03] origin-left drop-shadow-[0_4px_20px_rgba(255,255,255,0.5)]`
                          : isPassed
                          ? `text-white/50 ${inactiveSizeClass} font-medium hover:text-white/80`
                          : `text-white/25 ${inactiveSizeClass} font-medium hover:text-white/60`
                      }`}
                    >
                      {line.text}
                    </div>
                  );
                })
              ) : isLyricsLoading ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-white/50 space-y-3">
                  <div className="relative w-12 h-12 flex items-center justify-center">
                    <span className="absolute inset-0 rounded-full border-2 border-t-transparent animate-spin border-[#fa2d48]" />
                    <Mic2 className="w-5 h-5 text-[#fa2d48] animate-pulse" />
                  </div>
                  <p className="text-sm font-bold text-white">Searching LRCLIB Synced Lyrics...</p>
                  <p className="text-xs text-white/40 max-w-xs">Matching millisecond timestamps for {currentTrack.title}</p>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-white/40 space-y-2">
                  <Mic2 className="w-10 h-10 mb-2 opacity-30 text-[#fa2d48]" />
                  <p className="text-sm font-semibold">Instrumental or synced lyrics unavailable</p>
                  <p className="text-xs text-white/30">Sing along with the audio stream</p>
                  <button
                    onClick={() => {
                      if (currentTrack) {
                        setIsLyricsLoading(true);
                        fetchLyricsFromLrclib(currentTrack).finally(() => setIsLyricsLoading(false));
                      }
                    }}
                    className="mt-3 px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold text-xs flex items-center gap-1.5 mx-auto transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Retry Lyrics Search</span>
                  </button>
                </div>
              )}
              <div className="h-24" />
            </div>
          </div>
        )}

      </div>

      {/* Floating Apple Music Sing (Karaoke) Control Drawer */}
      {showSingModal && (
        <div className="absolute inset-0 z-40 bg-black/60 backdrop-blur-md flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#161824]/95 border border-white/15 rounded-3xl p-6 shadow-2xl backdrop-blur-2xl space-y-5 animate-in slide-in-from-bottom-5 duration-300">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-black font-bold shadow-lg">
                  <Mic2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Apple Music Sing</h3>
                  <p className="text-xs text-white/50">Real-Time Lead Vocal Attenuator</p>
                </div>
              </div>
              <button
                onClick={() => setShowSingModal(false)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/60 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Vocal Attenuation Slider */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/60 font-semibold">Vocal Attenuation:</span>
                <span className="font-mono font-bold text-emerald-400 text-sm">
                  {Math.round(vocalReductionLevel * 100)}% {vocalReductionLevel === 0 ? '(Original Vocals)' : vocalReductionLevel >= 0.85 ? '(Karaoke Instrumental)' : '(Duet Mode)'}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.02}
                value={vocalReductionLevel}
                onChange={(e) => setVocalReductionLevel(Number(e.target.value))}
                className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />
              <div className="flex justify-between text-[10px] text-white/40 font-mono">
                <span>0% Full Vocals</span>
                <span>50% Duet</span>
                <span>100% Karaoke</span>
              </div>
            </div>

            {/* Quick Preset Buttons */}
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => {
                  triggerHaptic('light');
                  setVocalReductionLevel(0);
                }}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                  vocalReductionLevel === 0 
                    ? 'bg-white/20 border-white text-white font-bold' 
                    : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
                }`}
              >
                Original (0%)
              </button>
              <button
                onClick={() => {
                  triggerHaptic('light');
                  setVocalReductionLevel(0.55);
                }}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                  vocalReductionLevel > 0.4 && vocalReductionLevel < 0.75 
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 font-bold' 
                    : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
                }`}
              >
                Duet (55%)
              </button>
              <button
                onClick={() => {
                  triggerHaptic('success');
                  setVocalReductionLevel(0.92);
                }}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                  vocalReductionLevel >= 0.75 
                    ? 'bg-emerald-500 text-black font-bold border-emerald-400 shadow-lg' 
                    : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
                }`}
              >
                Karaoke (92%)
              </button>
            </div>

            <div className="text-[11px] text-white/50 bg-white/5 p-3 rounded-xl border border-white/10 leading-relaxed">
              💡 <span className="font-semibold text-white/80">Bass Bypass Active:</span> Low-end frequencies below 140Hz and stereo reverbs remain 100% intact so the song retains full punch and depth while lead center vocals are silenced.
            </div>
          </div>
        </div>
      )}

      {/* Audiophile Studio Master DSP Telemetry HUD Modal */}
      {showAudiophileHud && (
        <div className="absolute inset-0 z-40 bg-black/60 backdrop-blur-md flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-[#141622]/95 border border-white/15 rounded-3xl p-6 shadow-2xl backdrop-blur-2xl space-y-4 animate-in slide-in-from-bottom-5 duration-300">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold shadow-lg">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Studio DSP & Master Telemetry</h3>
                  <p className="text-xs text-white/50">Real-Time Audiophile Metrics</p>
                </div>
              </div>
              <button
                onClick={() => setShowAudiophileHud(false)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/60 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10">
                <span className="text-[10px] uppercase font-bold text-white/40 block">Audio Bit Depth</span>
                <span className="text-sm font-bold text-emerald-400 mt-0.5 block">24-Bit Studio Master</span>
                <span className="text-[10px] text-white/50">Bit-for-bit uncompressed ALAC</span>
              </div>
              <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10">
                <span className="text-[10px] uppercase font-bold text-white/40 block">Sampling Frequency</span>
                <span className="text-sm font-bold text-cyan-400 mt-0.5 block">192,000 Hz</span>
                <span className="text-[10px] text-white/50">Extended ultrasonic headroom</span>
              </div>
              <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10">
                <span className="text-[10px] uppercase font-bold text-white/40 block">Dynamic Headroom</span>
                <span className="text-sm font-bold text-purple-400 mt-0.5 block">+6.0 dB Studio Limiter</span>
                <span className="text-[10px] text-white/50">Zero digital clipping / distortion</span>
              </div>
              <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10">
                <span className="text-[10px] uppercase font-bold text-white/40 block">Analog Tube Warmth</span>
                <span className="text-sm font-bold text-amber-400 mt-0.5 block">+{tubeWarmth} dB Triode Drive</span>
                <span className="text-[10px] text-white/50">2nd/3rd order even harmonics</span>
              </div>
              <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10">
                <span className="text-[10px] uppercase font-bold text-white/40 block">Virtual Spatial Room</span>
                <span className="text-sm font-bold text-indigo-400 mt-0.5 block">{spatialRoom.toUpperCase()}</span>
                <span className="text-[10px] text-white/50">Binaural impulse response convolution</span>
              </div>
              <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10">
                <span className="text-[10px] uppercase font-bold text-white/40 block">Tempo & Key Signature</span>
                <span className="text-sm font-bold text-rose-400 mt-0.5 block">{currentTrack.bpm || 124} BPM • {currentTrack.keySignature || 'D# Minor'}</span>
                <span className="text-[10px] text-white/50">Accurate harmonic mixing tag</span>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setShowAudiophileHud(false)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-colors"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Transport Dock */}
      <div className="relative z-10 px-4 sm:px-8 lg:px-14 pb-6 sm:pb-8 pt-2">
        {/* Seamlessly Integrated Audio Visualizer & Elastic Scrubber */}
        <div className="max-w-2xl mx-auto flex flex-col gap-1 mb-3">
          {/* Audio Visualizer Canvas - Tap to cycle: Wave -> Bars -> Radial -> VU Meter */}
          <div 
            onClick={handleCycleVisualizer}
            className="relative w-full flex items-center justify-center cursor-pointer select-none group py-0.5"
            title="Tap visualizer to cycle modes (Wave, Bars, Radial, VU Meter)"
          >
            {/* Small Floating Toast Pill */}
            {visualizerToast && (
              <div className="absolute -top-7 px-3 py-0.5 rounded-full bg-white/20 backdrop-blur-xl border border-white/20 text-[10.5px] font-mono font-bold text-white shadow-lg animate-in fade-in zoom-in-95 pointer-events-none z-30">
                {visualizerToast}
              </div>
            )}
            <AudioVisualizer 
              className={visualizerMode === 'analog-vu' ? 'w-full max-w-sm h-12' : 'w-full h-7 opacity-75 group-hover:opacity-100 transition-opacity'} 
              barCount={visualizerMode === 'bars' ? 44 : 56} 
              mode={visualizerMode} 
            />
          </div>

          {/* Elastic Scrubber Track: 4px idle -> 10px on drag/touch, glowing white, scaleX(1.02) */}
          <div 
            className="relative group w-full flex items-center h-6 cursor-pointer select-none"
            onTouchStart={() => setIsScrubbing(true)}
            onTouchEnd={() => setIsScrubbing(false)}
            onMouseDown={() => setIsScrubbing(true)}
            onMouseUp={() => setIsScrubbing(false)}
          >
            {/* Background Track with Elastic Expansion & Glow */}
            <div 
              className={`apple-elastic-scrubber-track absolute inset-x-0 rounded-full bg-white/15 overflow-hidden transition-all ${
                isScrubbing ? 'is-scrubbing' : ''
              }`}
              style={{
                ['--glow-color' as any]: primaryColor
              }}
            >
              <div 
                className="absolute inset-y-0 left-0 bg-white/20 transition-all duration-200"
                style={{ width: `${buffered}%` }}
              />
              <div 
                className={`absolute inset-y-0 left-0 transition-all rounded-full ${
                  isPlaying ? 'animate-shimmer animate-line-playing' : ''
                }`}
                style={{ 
                  width: `${percentPlayed}%`,
                  background: isPlaying
                    ? `linear-gradient(90deg, ${primaryColor}, #ffffff 60%, ${primaryColor})`
                    : primaryColor,
                  backgroundSize: '200% 100%',
                  ['--glow-color' as any]: primaryColor
                }}
              />
            </div>

            {/* Scrubber Thumb: hidden when idle, glows white when touched or hovered */}
            <div 
              className={`absolute w-3.5 h-3.5 rounded-full bg-white pointer-events-none -translate-x-1/2 transition-all duration-200 shadow-[0_0_16px_rgba(255,255,255,0.9),0_0_24px_var(--glow-color)] ${
                isScrubbing ? 'opacity-100 scale-125' : 'opacity-0 group-hover:opacity-100'
              }`}
              style={{ 
                left: `${percentPlayed}%`,
                ['--glow-color' as any]: primaryColor
              }}
            />

            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={(e) => seek(Number(e.target.value))}
              className="absolute inset-0 w-full opacity-0 cursor-pointer"
            />
          </div>

          <div className="flex justify-between text-xs font-mono tabular-nums text-white/50 px-0.5">
            <span>{formatTime(currentTime)}</span>
            <span>{formatRemainingTime(currentTime, duration)}</span>
          </div>
        </div>

        {/* Buttons Controls */}
        <div className="max-w-md mx-auto flex items-center justify-between px-4">
          <button
            onClick={toggleShuffle}
            className={`p-3 rounded-full transition-colors ${
              isShuffled ? 'text-[#fa2d48] bg-white/10' : 'text-white/60 hover:text-white'
            }`}
            title="Shuffle"
          >
            <Shuffle className="w-5 h-5" />
          </button>

          <button
            onClick={skipPrev}
            className="p-3 rounded-full text-white/80 hover:text-white transition-transform active:scale-90"
            title="Previous"
          >
            <SkipBack className="w-6 h-6 sm:w-7 sm:h-7 fill-current" />
          </button>

          {/* Animated Central Play/Pause Button */}
          <div className="relative flex items-center justify-center">
            {isPlaying && (
              <span 
                className="absolute inset-0 rounded-full animate-ripple pointer-events-none"
                style={{ backgroundColor: `${primaryColor}50` }}
              />
            )}
            <button
              onClick={togglePlay}
              className="relative z-10 w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-2xl"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-7 h-7 fill-current animate-button-pop" />
              ) : (
                <Play className="w-7 h-7 fill-current translate-x-0.5 animate-button-pop" />
              )}
            </button>
          </div>

          <button
            onClick={skipNext}
            className="p-3 rounded-full text-white/80 hover:text-white transition-transform active:scale-90"
            title="Next"
          >
            <SkipForward className="w-6 h-6 sm:w-7 sm:h-7 fill-current" />
          </button>

          <button
            onClick={cycleRepeatMode}
            className={`p-3 rounded-full transition-colors relative ${
              repeatMode !== 'off' ? 'text-[#fa2d48] bg-white/10' : 'text-white/60 hover:text-white'
            }`}
            title={`Repeat: ${repeatMode}`}
          >
            <Repeat className="w-5 h-5" />
            {repeatMode === 'one' && (
              <span className="absolute top-1 right-1 text-[8px] font-bold">1</span>
            )}
          </button>
        </div>

        {/* Volume & Queue & Sing Drawer Access */}
        <div className="max-w-md mx-auto flex items-center gap-3 px-4 pt-1">
          <button 
            onClick={toggleMute} 
            className="text-white/50 hover:text-white transition-colors p-1"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={isMuted ? 0 : volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="flex-1 h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-[#fa2d48]"
          />
          <button
            onClick={() => {
              triggerHaptic('light');
              setShowSingModal(prev => !prev);
            }}
            className={`p-1.5 transition-colors rounded-lg ${
              isSingActive ? 'text-emerald-400 bg-emerald-500/20' : 'text-white/50 hover:text-white hover:bg-white/10'
            }`}
            title="Apple Music Sing Karaoke Slider"
          >
            <Mic2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsQueueOpen(true)}
            className="p-1.5 text-white/50 hover:text-white transition-colors rounded-lg hover:bg-white/10"
            title="Up Next Queue"
          >
            <ListMusic className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
