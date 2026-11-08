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
import { AudioVisualizer } from './AudioVisualizer';
import { CanvasWaveScrubber } from './CanvasWaveScrubber';
import { get4kArtworkUrl, handleArtworkError } from '../utils/artworkUtils';
import { formatTime, formatRemainingTime } from '../utils/formatTime';
import { triggerHaptic } from '../utils/haptics';

// Decoupled scrubber subcomponent for the Island Peek Card with instant 120fps touch tracking & zero stutter
const IslandScrubber = memo(({ primaryColor, isPlaying }: { primaryColor: string; isPlaying: boolean }) => {
  const { currentTime, duration, seek } = useAudio();
  const [isHovered, setIsHovered] = useState(false);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [instantPercent, setInstantPercent] = useState<number | null>(null);
  const barRef = useRef<HTMLDivElement | null>(null);

  const progressPercent = duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0;
  const activePercent = isScrubbing && instantPercent !== null ? instantPercent : progressPercent;
  const activeTime = isScrubbing && instantPercent !== null ? (instantPercent / 100) * duration : currentTime;

  const calculatePercent = (clientX: number) => {
    if (!barRef.current) return 0;
    const rect = barRef.current.getBoundingClientRect();
    const clickX = Math.max(0, Math.min(clientX - rect.left, rect.width));
    return Math.max(0, Math.min(100, (clickX / rect.width) * 100));
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
    setIsScrubbing(true);
    const p = calculatePercent(e.clientX);
    setInstantPercent(p);
    triggerHaptic('selection');
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isScrubbing) return;
    e.stopPropagation();
    const p = calculatePercent(e.clientX);
    setInstantPercent(p);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isScrubbing) return;
    e.stopPropagation();
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
    const finalPercent = instantPercent !== null ? instantPercent : calculatePercent(e.clientX);
    seek((finalPercent / 100) * duration);
    setIsScrubbing(false);
    setInstantPercent(null);
    triggerHaptic('medium');
  };

  return (
    <div className="w-full space-y-1.5 px-1">
      <div
        ref={barRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={() => {
          setIsScrubbing(false);
          setInstantPercent(null);
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative group w-full h-5 flex items-center cursor-pointer select-none touch-none"
      >
        <div className="relative w-full h-1.5 rounded-full bg-white/20 overflow-hidden group-hover:h-2 transition-all duration-200">
          <div
            className={`h-full rounded-full transition-all duration-75 ${
              isPlaying ? 'animate-shimmer animate-line-playing' : ''
            }`}
            style={{
              width: `${activePercent}%`,
              background: isPlaying
                ? `linear-gradient(90deg, ${primaryColor}, #ffffff 60%, ${primaryColor})`
                : primaryColor
            }}
          />
        </div>

        {/* Real-Time Canvas Wave Scrubber Overlay */}
        <CanvasWaveScrubber
          isPlaying={isPlaying}
          percentPlayed={activePercent}
          primaryColor={primaryColor}
          isHovered={isHovered}
          isScrubbing={isScrubbing}
        />
      </div>

      <div className="flex items-center justify-between text-[11px] font-mono tabular-nums text-white/55 px-0.5">
        <span>{formatTime(activeTime)}</span>
        <span>-{formatRemainingTime(activeTime, duration)}</span>
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
  const longPressTimerRef = useRef<number | null>(null);
  const isLongPressTriggeredRef = useRef(false);

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

  // Long-press vs tap detection for compact island
  const handleCompactPointerDown = () => {
    if (isExpanded) return;
    isLongPressTriggeredRef.current = false;
    longPressTimerRef.current = window.setTimeout(() => {
      isLongPressTriggeredRef.current = true;
      setIsExpanded(true);
      triggerHaptic('heavy');
    }, 340);
  };

  const handleCompactPointerUp = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    if (!isExpanded && !isLongPressTriggeredRef.current) {
      setIsExpanded(true);
      triggerHaptic('medium');
    }
  };

  const handleCompactPointerCancel = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

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
        className="relative flex items-center justify-center island-goo-dropzone"
        style={{ filter: 'url(#aura-goo)' }}
      >
        {/* ================================================================== */}
        {/* LIQUID MERCURY BLACK SILHOUETTE PILL(S)                            */}
        {/* ================================================================== */}
        <div className="flex items-center">
          {/* Main Black Pill Body - Spring Damped Expansion to 380px (border-radius: 36px) */}
          <div
            className={`bg-black transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              isRebounding ? 'animate-island-rebound' : ''
            } ${
              isExpanded
                ? 'w-[calc(100vw-20px)] max-w-[380px] min-h-[220px] rounded-[36px]'
                : 'w-[126px] h-[36px] rounded-full'
            }`}
          />

          {/* State B: Detached Droplet Pill Body (Separates & fuses via Gooey) */}
          {hasSecondaryDroplet && (
            <div
              className="w-[36px] h-[36px] ml-2 bg-black rounded-full transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] animate-droplet-split shrink-0"
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
        {/* Outer dynamic ambient rim border with Spring Damping */}
        <div 
          onPointerDown={!isExpanded ? handleCompactPointerDown : undefined}
          onPointerUp={!isExpanded ? handleCompactPointerUp : undefined}
          onPointerCancel={!isExpanded ? handleCompactPointerCancel : undefined}
          style={{
            borderColor: 'rgba(255, 255, 255, 0.12)',
            boxShadow: `0 0 0 1px ${primaryColor}24, 0 16px 45px rgba(0,0,0,0.92)`
          }}
          className={`relative border transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] flex items-center overflow-hidden cursor-pointer ${
            isRebounding ? 'animate-island-rebound' : ''
          } ${
            isExpanded
              ? 'w-[calc(100vw-20px)] max-w-[380px] p-4 rounded-[36px] cursor-default bg-[#05060b]/92 backdrop-blur-3xl'
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
                className="relative w-6 h-6 rounded-full overflow-hidden shrink-0 ring-1 ring-white/25 shadow-md active:scale-90 transition-transform flex items-center justify-center bg-black"
                title="Double-tap to open Fullscreen Player"
              >
                <img
                  src={get4kArtworkUrl(currentTrack)}
                  onError={handleArtworkError}
                  alt={currentTrack.title}
                  className={`w-full h-full object-cover ${
                    isPlaying ? 'animate-[spin_5s_linear_infinite]' : ''
                  }`}
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-white/20 pointer-events-none rounded-full" />
                <div className="absolute w-1.5 h-1.5 rounded-full bg-black ring-1 ring-white/40 pointer-events-none" />
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

                  {/* Title & Artist & Audiophile Badges with Smooth Scrolling Marquee */}
                  <div className="min-w-0 flex-1 overflow-hidden pr-1">
                    <div className="overflow-hidden whitespace-nowrap">
                      <h3 className="text-sm font-extrabold text-white tracking-tight leading-snug inline-block animate-marquee-smooth">
                        {currentTrack.title}
                      </h3>
                    </div>
                    <div className="overflow-hidden whitespace-nowrap mt-0.5">
                      <p className="text-xs text-white/60 truncate">
                        {currentTrack.artist}
                      </p>
                    </div>

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

              {/* Row 2: High-FPS Mini Canvas Wave Visualizer */}
              <div className="w-full px-1">
                <AudioVisualizer 
                  className="w-full h-7 rounded-xl bg-white/[0.04] px-1.5 py-0.5 border border-white/5 live-activity-canvas" 
                  barCount={38} 
                  mode="wave" 
                />
              </div>

              {/* Row 3: Instant 120fps Touch-Responsive Scrubber with Tabular Numbers */}
              <IslandScrubber primaryColor={primaryColor} isPlaying={isPlaying} />

              {/* Row 4: Tactile Previous, Play/Pause, Next, and Output Controls */}
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
