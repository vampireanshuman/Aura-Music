import React, { useState, useRef, useEffect, memo } from 'react';
import { useAudio } from '../context/AudioContext';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Maximize2, 
  ChevronUp, 
  Volume2, 
  Users, 
  Timer,
  PictureInPicture2
} from 'lucide-react';
import { AnimatedSoundBars } from './AnimatedSoundBars';
import { get4kArtworkUrl, handleArtworkError } from '../utils/artworkUtils';
import { formatTime, formatRemainingTime } from '../utils/formatTime';
import { triggerHaptic } from '../utils/haptics';

// Decoupled scrubber subcomponent for the Island Peek Card
const IslandScrubber = memo(({ primaryColor, isPlaying }: { primaryColor: string; isPlaying: boolean }) => {
  const { currentTime, duration, seek } = useAudio();
  const progressPercent = duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0;

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newPercent = Math.max(0, Math.min(1, clickX / rect.width));
    seek(newPercent * duration);
    triggerHaptic('selection');
  };

  return (
    <div className="w-full space-y-1.5 px-1">
      <div
        onClick={handleSeek}
        className="relative group w-full h-4 flex items-center cursor-pointer"
      >
        <div className="w-full h-1.5 rounded-full bg-white/20 overflow-hidden group-hover:h-2 transition-all duration-200">
          <div
            className={`h-full rounded-full transition-all duration-75 ${
              isPlaying ? 'animate-shimmer animate-line-playing' : ''
            }`}
            style={{
              width: `${progressPercent}%`,
              background: isPlaying
                ? `linear-gradient(90deg, ${primaryColor}, #ffffff 60%, ${primaryColor})`
                : primaryColor
            }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] font-mono tabular-nums text-white/55 px-0.5">
        <span>{formatTime(currentTime)}</span>
        <span>-{formatRemainingTime(currentTime, duration)}</span>
      </div>
    </div>
  );
});

IslandScrubber.displayName = 'IslandScrubber';

export const DynamicIsland: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    togglePlay,
    skipNext,
    skipPrev,
    setIsFullscreen,
    isFullscreen,
    activeThemeColor,
    soundQualityMode,
    isIslandActive,
    dismissIsland,
    activeTab,
    sleepTimerMinutes,
    requestPipIsland
  } = useAudio();

  const [isExpanded, setIsExpanded] = useState(false);
  const [isScrolledDown, setIsScrolledDown] = useState(false);
  const [isRebounding, setIsRebounding] = useState(false);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const lastArtworkTapRef = useRef<number>(0);
  const islandRef = useRef<HTMLDivElement | null>(null);

  // Scroll detection: Show Dynamic Island when user scrolls down
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolledDown(window.scrollY > 90);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Genie Suction Rebound Event Listener
  useEffect(() => {
    const handleRebound = () => {
      setIsRebounding(true);
      triggerHaptic('medium');
      setTimeout(() => {
        setIsRebounding(false);
      }, 550);
    };

    window.addEventListener('aura-island-rebound', handleRebound);
    return () => window.removeEventListener('aura-island-rebound', handleRebound);
  }, []);

  // Auto-collapse when clicking outside Peek Card
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (islandRef.current && !islandRef.current.contains(e.target as Node)) {
        setIsExpanded(false);
      }
    };

    if (isExpanded) {
      window.addEventListener('mousedown', handleOutsideClick);
      window.addEventListener('touchstart', handleOutsideClick as any, { passive: true });
    }
    return () => {
      window.removeEventListener('mousedown', handleOutsideClick);
      window.removeEventListener('touchstart', handleOutsideClick as any);
    };
  }, [isExpanded]);

  // Visibility logic:
  // Shows when track exists and user is either:
  // - explicitly minimized (isIslandActive), OR
  // - peek card is expanded, OR
  // - playing and scrolled down on page, OR
  // - playing in general on mobile
  const shouldRender = 
    Boolean(currentTrack) && 
    !isFullscreen && 
    (isIslandActive || isExpanded || isScrolledDown || isPlaying);

  if (!shouldRender || !currentTrack) return null;

  const primaryColor = activeThemeColor || currentTrack.dominantColor || '#fa2d48';

  // State B (Split Droplet) condition:
  // Active when user is in Jam Room, has Sleep Timer, or Hi-Res ALAC active
  const isJamActive = activeTab === 'room';
  const isSleepTimerActive = sleepTimerMinutes !== null && sleepTimerMinutes > 0;
  const isAlacActive = soundQualityMode === 'hi-res-lossless' || soundQualityMode === 'dolby-atmos';
  const hasSecondaryDroplet = !isExpanded && (isJamActive || isSleepTimerActive || isAlacActive);

  // Gesture Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartY(e.touches[0].clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY === null) return;
    const diffY = touchStartY - e.changedTouches[0].clientY;

    // Swipe UP (diffY > 30) -> Collapse peek card
    if (diffY > 30) {
      if (isExpanded) {
        setIsExpanded(false);
        triggerHaptic('light');
      } else {
        dismissIsland();
        triggerHaptic('light');
      }
    }
    // Swipe DOWN (diffY < -30) -> Morph directly into State D (FullscreenPlayer)
    else if (diffY < -30) {
      setIsExpanded(false);
      setIsFullscreen(true);
      triggerHaptic('medium');
    }

    setTouchStartY(null);
  };

  // Double-tap on artwork triggers State D (FullscreenPlayer)
  const handleArtworkTap = (e: React.MouseEvent) => {
    e.stopPropagation();
    const now = Date.now();
    if (now - lastArtworkTapRef.current < 320) {
      // Double tap!
      setIsExpanded(false);
      setIsFullscreen(true);
      triggerHaptic('heavy');
    } else {
      lastArtworkTapRef.current = now;
      if (!isExpanded) {
        setIsExpanded(true);
        triggerHaptic('medium');
      }
    }
  };

  return (
    <div
      ref={islandRef}
      role="region"
      aria-label="Dynamic Island Media Player"
      style={{
        top: 'max(env(safe-area-inset-top, 10px), 10px)',
      }}
      className="fixed left-1/2 -translate-x-1/2 z-[9999] pointer-events-auto select-none transition-transform duration-300"
    >
      {/* ==================================================================== */}
      {/* SVG GOOEY FILTER ENGINE WRAPPER ("Liquid Mercury" Fusion Layer)       */}
      {/* ==================================================================== */}
      <div 
        className="relative flex items-center justify-center"
        style={{ filter: 'url(#aura-goo)' }}
      >
        {/* ================================================================== */}
        {/* LIQUID MERCURY BLACK SILHOUETTE PILL(S)                            */}
        {/* ================================================================== */}
        <div className="flex items-center">
          {/* Main Black Pill Body */}
          <div
            className={`bg-black transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
              isRebounding ? 'animate-island-rebound' : ''
            } ${
              isExpanded
                ? 'w-[calc(100vw-24px)] max-w-[370px] min-h-[175px] rounded-[42px]'
                : 'w-[126px] h-[36px] rounded-full'
            }`}
          />

          {/* State B: Detached Droplet Pill Body (Separates & fuses via Gooey) */}
          {hasSecondaryDroplet && (
            <div
              className="w-[36px] h-[36px] ml-2 bg-black rounded-full transition-all duration-400 ease-[cubic-bezier(0.32,0.72,0,1)] animate-droplet-split shrink-0"
            />
          )}
        </div>
      </div>

      {/* ==================================================================== */}
      {/* CRISP FOREGROUND CONTENT LAYER (Sharp Typography, Art & Controls)    */}
      {/* ==================================================================== */}
      <div 
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="absolute inset-0 flex items-center justify-center pointer-events-auto"
      >
        {/* Outer dynamic ambient rim border */}
        <div 
          onClick={!isExpanded ? () => { setIsExpanded(true); triggerHaptic('medium'); } : undefined}
          style={{
            borderColor: 'rgba(255, 255, 255, 0.12)',
            boxShadow: `0 0 0 1px ${primaryColor}24, 0 16px 45px rgba(0,0,0,0.92)`
          }}
          className={`relative border transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] flex items-center overflow-hidden cursor-pointer ${
            isRebounding ? 'animate-island-rebound' : ''
          } ${
            isExpanded
              ? 'w-[calc(100vw-24px)] max-w-[370px] p-4 rounded-[42px] cursor-default'
              : 'w-[126px] h-[36px] px-2.5 rounded-full justify-between'
          }`}
        >
          {/* Ambient rim light reflection */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.04] via-transparent to-white/[0.08] pointer-events-none" />

          {/* ================================================================ */}
          {/* STATE A: COMPACT PILL (126px × 36px)                             */}
          {/* ================================================================ */}
          {!isExpanded ? (
            <div className="relative z-10 w-full flex items-center justify-between gap-1.5">
              {/* Left: 24x24 Spinning Vinyl / Rounded Album Art */}
              <div 
                onClick={handleArtworkTap}
                className="relative w-6 h-6 rounded-full overflow-hidden shrink-0 ring-1 ring-white/25 shadow-md active:scale-90 transition-transform"
                title="Double-tap to open Fullscreen Player"
              >
                <img
                  src={get4kArtworkUrl(currentTrack)}
                  onError={handleArtworkError}
                  alt={currentTrack.title}
                  className={`w-full h-full object-cover ${
                    isPlaying ? 'animate-[spin_6s_linear_infinite]' : ''
                  }`}
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-white/20 pointer-events-none" />
              </div>

              {/* Center subtle indicator */}
              <div className="flex-1 flex justify-center overflow-hidden">
                <span className="text-[10px] font-bold text-white/70 truncate max-w-[55px] tracking-tight">
                  {currentTrack.title}
                </span>
              </div>

              {/* Right: Mini 5-Bar Animated SoundBars */}
              <div className="shrink-0 flex items-center pr-0.5">
                <AnimatedSoundBars isPlaying={isPlaying} color={primaryColor} size="sm" />
              </div>
            </div>
          ) : (
            /* ============================================================== */
            /* STATE C: LONG-PRESS / TAP HAPTIC PEEK CARD (max 370px × 175px)  */
            /* ============================================================== */
            <div className="relative z-10 w-full flex flex-col gap-3 animate-in fade-in zoom-in-95 duration-200">
              {/* Row 1: 64x64 Glowing Artwork + Title + Lossless Badge + Collapse */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {/* 64x64 Album Art with Ambient Underglow */}
                  <div 
                    onClick={handleArtworkTap}
                    className="relative w-16 h-16 rounded-2xl overflow-hidden shrink-0 shadow-2xl ring-1 ring-white/20 cursor-pointer active:scale-95 transition-transform group"
                    title="Double-tap to open Fullscreen Player"
                  >
                    <img
                      src={get4kArtworkUrl(currentTrack)}
                      onError={handleArtworkError}
                      alt={currentTrack.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-tr from-black/30 via-transparent to-white/20 pointer-events-none" />
                    
                    {/* Hover expand hint icon */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Maximize2 className="w-5 h-5 text-white" />
                    </div>
                  </div>

                  {/* Title & Artist & Audiophile Badges */}
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-extrabold text-white truncate tracking-tight leading-snug">
                      {currentTrack.title}
                    </h3>
                    <p className="text-xs text-white/60 truncate mt-0.5">
                      {currentTrack.artist}
                    </p>

                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="text-[9px] font-mono font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-white/80 border border-white/10 shadow-sm uppercase">
                        {soundQualityMode === 'hi-res-lossless' ? 'ALAC 24-Bit / 192k' : 'ALAC Lossless'}
                      </span>
                      {activeTab === 'room' && (
                        <span className="text-[9px] font-semibold flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          <Users className="w-2.5 h-2.5" />
                          Jam Live
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Soundbars & Collapse Chevron */}
                <div className="flex items-center gap-2 shrink-0">
                  <AnimatedSoundBars isPlaying={isPlaying} color={primaryColor} size="md" />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsExpanded(false);
                      triggerHaptic('light');
                    }}
                    className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/60 hover:text-white transition-all active:scale-90"
                    title="Collapse Peek Card"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Row 2: Interactive Scrubber with Tabular Numbers */}
              <IslandScrubber primaryColor={primaryColor} isPlaying={isPlaying} />

              {/* Row 3: Tactile Previous, Play/Pause, Next, and Output Controls */}
              <div className="flex items-center justify-between pt-0.5">
                {/* Expand into Fullscreen Player */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(false);
                    setIsFullscreen(true);
                    triggerHaptic('medium');
                  }}
                  className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all active:scale-90"
                  title="Expand to Fullscreen Player"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>

                {/* Transport Controls */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      skipPrev();
                      triggerHaptic('light');
                    }}
                    className="p-2 text-white/70 hover:text-white active:scale-90 transition-transform"
                    title="Previous Track"
                  >
                    <SkipBack className="w-5 h-5 fill-current" />
                  </button>

                  {/* Tactile Play/Pause 42x42 */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePlay();
                      triggerHaptic('medium');
                    }}
                    className="w-11 h-11 rounded-full bg-white text-black flex items-center justify-center shadow-[0_4px_18px_rgba(255,255,255,0.3)] active:scale-90 hover:scale-105 transition-all"
                    title={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? (
                      <Pause className="w-5 h-5 fill-current animate-button-pop" />
                    ) : (
                      <Play className="w-5 h-5 fill-current translate-x-0.5 animate-button-pop" />
                    )}
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      skipNext();
                      triggerHaptic('light');
                    }}
                    className="p-2 text-white/70 hover:text-white active:scale-90 transition-transform"
                    title="Next Track"
                  >
                    <SkipForward className="w-5 h-5 fill-current" />
                  </button>
                </div>

                {/* Right Action Icons: PiP Floating Island + AirPlay Output Indicator */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      triggerHaptic('medium');
                      requestPipIsland();
                    }}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all active:scale-90"
                    title="Float Live Dynamic Island over other apps (Picture-in-Picture)"
                  >
                    <PictureInPicture2 className="w-4 h-4" />
                  </button>

                  <div className="p-2 text-white/45 hover:text-white/80 transition-colors">
                    <Volume2 className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ================================================================== */}
        {/* STATE B: DETACHED SECONDARY DROPLET (36px × 36px)                  */}
        {/* ================================================================== */}
        {hasSecondaryDroplet && (
          <div
            onClick={() => {
              if (isJamActive) {
                // If in room, maybe open jam room or peek
                setIsExpanded(true);
              } else {
                setIsExpanded(true);
              }
              triggerHaptic('light');
            }}
            style={{
              borderColor: 'rgba(255, 255, 255, 0.12)',
              boxShadow: `0 0 0 1px ${primaryColor}24, 0 12px 30px rgba(0,0,0,0.85)`
            }}
            className="w-[36px] h-[36px] ml-2 rounded-full border bg-black flex items-center justify-center text-white cursor-pointer active:scale-90 transition-all shadow-lg animate-droplet-split shrink-0"
            title={isJamActive ? 'Jam Room Active' : isAlacActive ? 'ALAC Lossless Active' : 'Sleep Timer Active'}
          >
            {isJamActive ? (
              <Users className="w-4 h-4 text-emerald-400 animate-pulse" />
            ) : isSleepTimerActive ? (
              <Timer className="w-4 h-4 text-amber-400" />
            ) : (
              <span className="text-[8px] font-mono font-black text-amber-300 tracking-tighter">
                ALAC
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
