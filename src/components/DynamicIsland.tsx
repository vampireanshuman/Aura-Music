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
  X
} from 'lucide-react';
import { AnimatedSoundBars } from './AnimatedSoundBars';
import { get4kArtworkUrl, handleArtworkError } from '../utils/artworkUtils';
import { formatTime, formatRemainingTime } from '../utils/formatTime';
import { triggerHaptic } from '../utils/haptics';

// Decoupled scrubber subcomponent to prevent parent Dynamic Island re-renders on audio frames
const DynamicIslandScrubber = memo(({ primaryColor, isPlaying }: { primaryColor: string; isPlaying: boolean }) => {
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
    <div className="space-y-1">
      <div
        onClick={handleSeek}
        className="relative group w-full h-4 flex items-center cursor-pointer"
      >
        <div className="w-full h-1.5 rounded-full bg-white/20 overflow-hidden group-hover:h-2 transition-all">
          <div
            className={`h-full rounded-full transition-all duration-75 ${
              isPlaying ? 'animate-shimmer animate-line-playing' : ''
            }`}
            style={{
              width: `${progressPercent}%`,
              background: isPlaying
                ? `linear-gradient(90deg, ${primaryColor}, #ffffff 50%, ${primaryColor})`
                : primaryColor
            }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between text-[10px] font-mono text-white/50 px-0.5">
        <span>{formatTime(currentTime)}</span>
        <span>-{formatRemainingTime(currentTime, duration)}</span>
      </div>
    </div>
  );
});

DynamicIslandScrubber.displayName = 'DynamicIslandScrubber';

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
    dismissIsland
  } = useAudio();

  const [isExpanded, setIsExpanded] = useState(false);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const islandRef = useRef<HTMLDivElement | null>(null);

  // Auto collapse when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (islandRef.current && !islandRef.current.contains(e.target as Node)) {
        setIsExpanded(false);
      }
    };

    if (isExpanded) {
      window.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      window.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isExpanded]);

  // STRICT USER RULE: While using the app normally, DO NOT show the dynamic island.
  // Only show when the user minimizes (isIslandActive === true) and not in fullscreen!
  if (!isIslandActive || !currentTrack || isFullscreen) return null;

  const primaryColor = activeThemeColor || currentTrack.dominantColor || '#fa2d48';

  const handleCompactClick = () => {
    triggerHaptic('medium');
    setIsFullscreen(true);
    dismissIsland();
  };

  // Touch Swipe Gesture
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartY(e.touches[0].clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY === null) return;
    const touchEndY = e.changedTouches[0].clientY;
    const diff = touchStartY - touchEndY;
    
    // Swipe up on compact island dismisses it back into the app
    if (diff > 35) {
      if (isExpanded) {
        setIsExpanded(false);
      } else {
        dismissIsland();
      }
      triggerHaptic('light');
    }
    // Swipe down expands into the studio drawer
    else if (diff < -35 && !isExpanded) {
      setIsExpanded(true);
      triggerHaptic('light');
    }
    setTouchStartY(null);
  };

  return (
    <aside 
      aria-label="Dynamic Island Media Player"
      className="fixed top-2.5 sm:top-3 inset-x-0 mx-auto z-50 flex items-center justify-center pointer-events-none px-3 animate-in fade-in slide-in-from-top-4 duration-300"
    >
      <div
        ref={islandRef}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className={`pointer-events-auto bg-black text-white border border-white/20 shadow-[0_15px_45px_rgba(0,0,0,0.9)] backdrop-blur-3xl transform-gpu will-change-transform transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden select-none relative ${
          isExpanded
            ? 'w-[94vw] max-w-[380px] p-4 rounded-[36px] ring-1 ring-white/20'
            : 'h-11 px-3.5 min-w-[190px] max-w-[230px] rounded-full flex items-center justify-between gap-3 cursor-pointer hover:scale-105 active:scale-95'
        }`}
        onClick={!isExpanded ? handleCompactClick : undefined}
      >
        {/* Subtle Ambient Island Pulse while playing */}
        {isPlaying && (
          <div
            className="absolute -inset-1 rounded-full opacity-25 blur-md pointer-events-none transition-all duration-700 animate-pulse-subtle"
            style={{ backgroundColor: primaryColor }}
          />
        )}

        {/* ======================================================== */}
        {/* COMPACT ISLAND PILL STATE (Ultra-efficient, zero lag)     */}
        {/* ======================================================== */}
        {!isExpanded ? (
          <>
            {/* Left: Micro spinning vinyl album artwork */}
            <div className="flex items-center gap-2.5 min-w-0">
              <div 
                className={`relative w-7 h-7 rounded-full overflow-hidden ring-1 ring-white/30 shrink-0 shadow-md ${
                  isPlaying ? 'animate-[spin_6s_linear_infinite]' : ''
                }`}
              >
                <img
                  src={get4kArtworkUrl(currentTrack)}
                  onError={handleArtworkError}
                  alt={currentTrack.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-white/20" />
              </div>

              <div className="min-w-0 flex flex-col">
                <span className="text-xs font-bold text-white truncate max-w-[90px] leading-tight">
                  {currentTrack.title}
                </span>
                <span className="text-[10px] text-white/50 truncate max-w-[90px]">
                  {currentTrack.artist}
                </span>
              </div>
            </div>

            {/* Right: Soundbars & Expand trigger */}
            <div className="flex items-center gap-2 shrink-0">
              <AnimatedSoundBars isPlaying={isPlaying} color={primaryColor} size="sm" />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(true);
                  triggerHaptic('light');
                }}
                className="w-5 h-5 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-colors"
                title="Expand Island Studio"
              >
                <ChevronUp className="w-3 h-3 rotate-180" />
              </button>
            </div>
          </>
        ) : (
          /* ======================================================== */
          /* EXPANDED ISLAND STUDIO STATE                             */
          /* ======================================================== */
          <div className="w-full flex flex-col gap-3 relative z-10 animate-in fade-in zoom-in-95 duration-200">
            {/* Top Row: Artwork + Track details + Soundbars + Collapse + Dismiss */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative w-12 h-12 rounded-2xl overflow-hidden ring-1 ring-white/20 shrink-0 shadow-lg">
                  <img
                    src={get4kArtworkUrl(currentTrack)}
                    onError={handleArtworkError}
                    alt={currentTrack.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-black/30 via-transparent to-white/20" />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-sm font-extrabold text-white truncate leading-tight tracking-tight">
                      {currentTrack.title}
                    </h4>
                  </div>
                  <p className="text-xs text-white/60 truncate mt-0.5">
                    {currentTrack.artist}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-white/10 text-white/70 uppercase">
                      {soundQualityMode === 'dolby-atmos' ? 'Spatial 3D' : soundQualityMode === 'hi-res-lossless' ? '24-Bit / 192k' : 'Lossless'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <AnimatedSoundBars isPlaying={isPlaying} color={primaryColor} size="md" />
                
                {/* Collapse button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(false);
                    triggerHaptic('light');
                  }}
                  className="p-1 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                  title="Collapse Dynamic Island"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>

                {/* Dismiss button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(false);
                    dismissIsland();
                    triggerHaptic('light');
                  }}
                  className="p-1 rounded-full text-white/40 hover:text-red-400 hover:bg-white/10 transition-colors"
                  title="Close Dynamic Island"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Middle Row: Scrubber Line */}
            <DynamicIslandScrubber primaryColor={primaryColor} isPlaying={isPlaying} />

            {/* Bottom Row: Controls & Fullscreen Trigger */}
            <div className="flex items-center justify-between pt-1">
              {/* Fullscreen Expand Action */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(false);
                  setIsFullscreen(true);
                  dismissIsland();
                  triggerHaptic('medium');
                }}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all active:scale-90"
                title="Open Fullscreen Studio"
              >
                <Maximize2 className="w-4 h-4" />
              </button>

              {/* Main Transport Controls */}
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
                  <SkipBack className="w-4 h-4 fill-current" />
                </button>

                {/* Animated Central Play/Pause Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePlay();
                    triggerHaptic('medium');
                  }}
                  className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow-lg active:scale-90 hover:scale-105 transition-all"
                  title={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4 fill-current animate-button-pop" />
                  ) : (
                    <Play className="w-4 h-4 fill-current translate-x-0.5 animate-button-pop" />
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
                  <SkipForward className="w-4 h-4 fill-current" />
                </button>
              </div>

              {/* Volume / Indicator */}
              <div className="p-2 text-white/40">
                <Volume2 className="w-4 h-4" />
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
