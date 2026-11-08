import React, { useState, useRef } from 'react';
import { useAudio } from '../context/AudioContext';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Shuffle, 
  Repeat, 
  Volume2, 
  Volume1, 
  VolumeX, 
  Mic2, 
  ListMusic, 
  Sliders, 
  Maximize2, 
  Minimize2,
  Heart,
  Activity,
  Sparkles,
  Moon,
  Gauge,
  Check,
  Video
} from 'lucide-react';
import { formatTime, formatRemainingTime } from '../utils/formatTime';
import { AudioVisualizer } from './AudioVisualizer';
import { AnimatedSoundBars } from './AnimatedSoundBars';
import { get4kArtworkUrl, handleArtworkError } from '../utils/artworkUtils';
import { triggerHaptic } from '../utils/haptics';
import { TrackActionMenu } from './TrackActionMenu';
import { CanvasWaveScrubber } from './CanvasWaveScrubber';

export const PlayerBar: React.FC = () => {
  const {
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
    isLyricsOpen,
    setIsLyricsOpen,
    isQueueOpen,
    setIsQueueOpen,
    isEqualizerOpen,
    setIsEqualizerOpen,
    setIsAudioQualityModalOpen,
    soundQualityMode,
    setIsFullscreen,
    toggleFavorite,
    isFavorite,
    queue,
    playbackSpeed,
    setPlaybackSpeed,
    sleepTimerMinutes,
    sleepTimerRemaining,
    setSleepTimer,
    activeThemeColor,
    setIsVideoModalOpen,
    minimizeToIsland,
    isIslandActive,
    dismissIsland
  } = useAudio();

  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverX, setHoverX] = useState<number>(0);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [showMiniVisualizer, setShowMiniVisualizer] = useState(false);
  const [showSleepTimerMenu, setShowSleepTimerMenu] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [miniTouchStartX, setMiniTouchStartX] = useState<number | null>(null);
  const [miniTouchStartY, setMiniTouchStartY] = useState<number | null>(null);
  const [miniSwipeOffset, setMiniSwipeOffset] = useState<number>(0);
  const isSwipingRef = useRef(false);
  const progressBarRef = useRef<HTMLDivElement | null>(null);

  if (!currentTrack) return null;

  const isLiked = isFavorite(currentTrack.id);
  const percentPlayed = duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0;

  const handleProgressMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || duration <= 0) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const targetSecond = (x / rect.width) * duration;
    setHoverTime(targetSecond);
    setHoverX(x);
  };

  const handleProgressMouseLeave = () => {
    setHoverTime(null);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || duration <= 0) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    triggerHaptic('tick');
    seek((x / rect.width) * duration);
  };

  const formatTimer = (totalSeconds: number | null) => {
    if (totalSeconds === null || totalSeconds <= 0) return '';
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const SPEED_OPTIONS = [
    { label: '0.75x Slowed', val: 0.75 },
    { label: '0.85x Reverb', val: 0.85 },
    { label: '1.0x Normal', val: 1.0 },
    { label: '1.15x Breeze', val: 1.15 },
    { label: '1.25x Sped Up', val: 1.25 },
    { label: '1.5x Nightcore', val: 1.5 },
    { label: '2.0x Hyper', val: 2.0 },
  ];

  const primaryColor = activeThemeColor || currentTrack.dominantColor || '#fa2d48';

  return (
    <>
      {/* ============================================================ */}
      {/* 1. MOBILE FLOATING MINI-PLAYER (<lg screens)                */}
      {/* Floats 12px above MobileNavBar, 60px height, 18px radius    */}
      {/* ============================================================ */}
      <div 
        className="lg:hidden fixed inset-x-3 sm:inset-x-6 z-40 pointer-events-auto"
        style={{ bottom: 'calc(56px + var(--safe-bottom, 22px) + 10px)' }}
      >
        <div 
          onTouchStart={(e) => {
            setMiniTouchStartX(e.touches[0].clientX);
            setMiniTouchStartY(e.touches[0].clientY);
            isSwipingRef.current = false;
          }}
          onTouchMove={(e) => {
            if (miniTouchStartX === null || miniTouchStartY === null) return;
            const diffX = e.touches[0].clientX - miniTouchStartX;
            const diffY = e.touches[0].clientY - miniTouchStartY;
            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 8) {
              isSwipingRef.current = true;
              setMiniSwipeOffset(diffX * 0.45);
            }
          }}
          onTouchEnd={(e) => {
            if (miniTouchStartX !== null && miniTouchStartY !== null) {
              const diffX = e.changedTouches[0].clientX - miniTouchStartX;
              const diffY = miniTouchStartY - e.changedTouches[0].clientY;

              if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
                // Horizontal swipe: left = Next, right = Prev
                if (diffX < -40) {
                  triggerHaptic('selection');
                  skipNext();
                } else if (diffX > 40) {
                  triggerHaptic('selection');
                  skipPrev();
                }
              } else if (diffY > 30 && Math.abs(diffY) > Math.abs(diffX)) {
                // Swiping UP morphs into FullscreenPlayer
                triggerHaptic('medium');
                setIsFullscreen(true);
              } else if (!isSwipingRef.current && Math.abs(diffX) < 10 && Math.abs(diffY) < 10) {
                // Tap opens FullscreenPlayer
                triggerHaptic('light');
                setIsFullscreen(true);
              }
            }
            setMiniTouchStartX(null);
            setMiniTouchStartY(null);
            setMiniSwipeOffset(0);
            setTimeout(() => { isSwipingRef.current = false; }, 50);
          }}
          className="relative h-[60px] rounded-[18px] backdrop-blur-[32px] saturate-[200%] bg-[#0e101a]/85 border border-white/[0.09] shadow-[0_16px_40px_rgba(0,0,0,0.85)] overflow-hidden cursor-pointer spring-interactive flex flex-col justify-between"
        >
          {/* Razor-thin 3px Liquid Top Scrubber */}
          <div className="relative w-full h-[3px] bg-white/[0.08] overflow-hidden shrink-0">
            <div
              className="absolute inset-y-0 left-0 bg-white/20 transition-all duration-300"
              style={{ width: `${buffered}%` }}
            />
            <div
              className={`absolute inset-y-0 left-0 rounded-r-full transition-all duration-100 ${
                isPlaying ? 'animate-shimmer' : ''
              }`}
              style={{
                width: `${percentPlayed}%`,
                background: isPlaying
                  ? `linear-gradient(90deg, ${primaryColor}, #ffffff 60%, ${primaryColor})`
                  : primaryColor,
                backgroundSize: '200% 100%',
                boxShadow: isPlaying ? `0 0 10px ${primaryColor}` : 'none'
              }}
            />
          </div>

          {/* Mini-Player Main Row: ONLY 44x44 cover + auto-scrolling CSS marquee + Heart + Play/Pause (40x40) + Next */}
          <div className="flex items-center justify-between px-2.5 pb-1 flex-1 gap-2 min-h-0">
            {/* 44x44 Square Cover + Auto-Scrolling Marquee Column with Horizontal Swipe spring physics */}
            <div 
              className="flex items-center gap-2.5 min-w-0 flex-1 transition-transform"
              style={{
                transform: `translateX(${miniSwipeOffset}px)`,
                transition: miniSwipeOffset === 0 ? 'transform 0.35s cubic-bezier(0.22, 1, 0.36, 1)' : 'none'
              }}
            >
              <div className="relative w-[44px] h-[44px] shrink-0">
                {/* Duplicate blurred artwork shadow underneath */}
                <img
                  src={get4kArtworkUrl(currentTrack)}
                  onError={handleArtworkError}
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 w-full h-full object-cover rounded-xl blur-md scale-95 opacity-70 pointer-events-none -z-10"
                />
                
                {/* Primary Card Artwork: 1:1 true square with scale(1.12) cropping 16:9 bars */}
                <div className={`relative w-[44px] h-[44px] rounded-xl overflow-hidden shadow-[0_8px_20px_rgba(0,0,0,0.5)] flex items-center justify-center bg-black/60 transition-transform duration-500 ${
                  isPlaying ? 'scale-105' : 'scale-95 opacity-90'
                }`}>
                  <img
                    src={get4kArtworkUrl(currentTrack)}
                    onError={handleArtworkError}
                    alt={currentTrack.title}
                    className="w-full h-full object-cover object-center scale-[1.12]"
                  />
                  <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/10 pointer-events-none" />
                </div>
              </div>

              {/* Title & Artist with flexible container and clean edge mask so text never clips */}
              <div 
                style={{
                  flex: '1 1 0%',
                  minWidth: 0,
                  overflow: 'hidden',
                  position: 'relative',
                  WebkitMaskImage: 'linear-gradient(90deg, #000 86%, transparent 100%)',
                  maskImage: 'linear-gradient(90deg, #000 86%, transparent 100%)'
                }}
                className="flex-1 min-w-0 overflow-hidden relative pr-2"
              >
                <div className="overflow-hidden whitespace-nowrap">
                  <h4 
                    className={`text-xs sm:text-sm font-bold text-white tracking-tight leading-tight select-none ${
                      (currentTrack.title?.length || 0) > 28 
                        ? 'inline-block animate-marquee-smooth hover:pause' 
                        : 'truncate'
                    }`}
                    title={currentTrack.title}
                  >
                    {currentTrack.title}
                  </h4>
                </div>
                <div className="overflow-hidden whitespace-nowrap mt-0.5 flex items-center gap-1.5">
                  <p className="text-[11px] text-white/65 font-medium truncate">
                    {currentTrack.artist}
                  </p>
                  <span className={`text-[8.5px] font-mono font-bold px-1.5 py-0.2 rounded-full border shrink-0 ${
                    soundQualityMode === 'hi-res-lossless' ? 'bg-amber-500/20 text-amber-300 border-amber-400/40' :
                    soundQualityMode === 'cd-lossless' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40' :
                    soundQualityMode === 'dolby-atmos' ? 'bg-purple-500/20 text-purple-300 border-purple-400/40' :
                    'bg-white/10 text-white/60 border-white/15'
                  }`}>
                    {soundQualityMode === 'hi-res-lossless' ? '24-Bit' : soundQualityMode === 'cd-lossless' ? 'Lossless' : soundQualityMode === 'dolby-atmos' ? 'Spatial' : '320k'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Action Controls: ONLY Heart, Play/Pause (40x40), and Next Track */}
            <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
              {/* Like Button */}
              <button
                onClick={() => toggleFavorite(currentTrack.id, currentTrack)}
                className="w-9 h-9 flex items-center justify-center text-white/65 hover:text-white spring-button"
                title={isLiked ? 'Liked' : 'Like'}
              >
                <Heart className={`w-4 h-4 transition-transform ${
                  isLiked ? 'fill-[#fa2d48] text-[#fa2d48] scale-110 drop-shadow-[0_0_8px_rgba(250,45,72,0.8)]' : ''
                }`} />
              </button>

              {/* Animated Central Play/Pause Button (40x40) */}
              <div className="relative flex items-center justify-center">
                {isPlaying && (
                  <span 
                    className="absolute inset-0 rounded-full animate-ripple pointer-events-none"
                    style={{ backgroundColor: `${primaryColor}40` }}
                  />
                )}

                <button
                  onClick={togglePlay}
                  className="relative z-10 w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow-lg spring-button"
                  title={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4 fill-current animate-button-pop" />
                  ) : (
                    <Play className="w-4 h-4 fill-current translate-x-0.5 animate-button-pop" />
                  )}
                </button>
              </div>

              {/* Skip Next */}
              <button
                onClick={skipNext}
                className="w-9 h-9 flex items-center justify-center text-white/65 hover:text-white spring-button"
                title="Next Song"
              >
                <SkipForward className="w-4 h-4 fill-current" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. DESKTOP FLOATING NOW PLAYING DOCK (>=lg screens)           */}
      {/* ============================================================ */}
      <footer className="hidden lg:block fixed bottom-5 inset-x-0 z-40 px-4 sm:px-6 pointer-events-none">
        <div className="max-w-6xl mx-auto glass-dock px-6 py-3.5 pointer-events-auto transition-all duration-500 relative">
          <div className="flex items-center justify-between gap-6">
            
            {/* Left: Track Info & Step 3 Artwork with Duplicate Blurred Shadow */}
            <div className="flex items-center gap-3.5 min-w-0 w-1/4">
              <div 
                className="relative w-14 h-14 shrink-0 group cursor-pointer"
                onClick={() => setIsFullscreen(true)}
              >
                {/* Duplicate blurred artwork shadow underneath */}
                <img
                  src={get4kArtworkUrl(currentTrack)}
                  onError={handleArtworkError}
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 w-full h-full object-cover rounded-2xl blur-lg scale-95 opacity-70 group-hover:scale-105 group-hover:opacity-90 transition-all duration-500 -z-10 pointer-events-none"
                />

                {/* Primary Card Artwork */}
                <div className="relative w-14 h-14 rounded-2xl overflow-hidden shadow-[0_12px_32px_rgba(0,0,0,0.4)] flex items-center justify-center bg-black/60 transition-transform duration-500 group-hover:scale-105">
                  <img
                    src={get4kArtworkUrl(currentTrack)}
                    onError={handleArtworkError}
                    alt={currentTrack.title}
                    className="w-full h-full object-cover object-center scale-[1.08]"
                  />
                  {/* Inner rim highlight */}
                  <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10 pointer-events-none" />

                  {/* Expand icon on hover */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
                    <Maximize2 className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>

              {/* Step 2: Strict Visual Weight Hierarchy */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h4 
                    onClick={() => setIsFullscreen(true)}
                    className="text-sm font-bold text-white tracking-tight truncate cursor-pointer hover:underline"
                  >
                    {currentTrack.title}
                  </h4>
                  <AnimatedSoundBars isPlaying={isPlaying} color={primaryColor} size="sm" />
                </div>
                <p className="text-xs text-white/65 font-medium truncate mt-0.5">
                  {currentTrack.artist}
                </p>
              </div>

              {/* Watch Video Button */}
              <button
                onClick={() => setIsVideoModalOpen(true)}
                className="p-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 hover:text-white spring-button shrink-0"
                title="Watch Music Video"
              >
                <Video className="w-4 h-4 text-purple-400" />
              </button>

              {/* Favorite heart button */}
              <button
                onClick={() => toggleFavorite(currentTrack.id, currentTrack)}
                className="p-2 rounded-full text-white/50 hover:text-white spring-button shrink-0"
                title={isLiked ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Heart className={`w-5 h-5 transition-transform ${
                  isLiked ? 'fill-[#fa2d48] text-[#fa2d48] scale-110 drop-shadow-[0_0_10px_rgba(250,45,72,0.8)]' : 'hover:text-white'
                }`} />
              </button>

              {/* Action Menu */}
              <TrackActionMenu track={currentTrack} />
            </div>

            {/* Middle: Controls & Step 4 Razor-Thin 4px Scrubber */}
            <div className="flex-1 max-w-xl flex flex-col items-center">
              {/* Transport Buttons */}
              <div className="flex items-center gap-5 mb-2">
                <button
                  onClick={toggleShuffle}
                  className={`p-2 rounded-full spring-button relative ${
                    isShuffled ? 'text-[#fa2d48]' : 'text-white/40 hover:text-white'
                  }`}
                  title={isShuffled ? 'Shuffle On' : 'Shuffle Off'}
                >
                  <Shuffle className="w-4 h-4" />
                  {isShuffled && (
                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#fa2d48]" />
                  )}
                </button>

                <button
                  onClick={skipPrev}
                  className="p-2 text-white/65 hover:text-white spring-button"
                  title="Previous (Arrow Left)"
                >
                  <SkipBack className="w-5 h-5 fill-current" />
                </button>

                {/* Animated Central Play/Pause Button */}
                <div className="relative flex items-center justify-center">
                  {isPlaying && (
                    <span 
                      className="absolute inset-0 rounded-full animate-ripple pointer-events-none"
                      style={{ backgroundColor: `${primaryColor}40` }}
                    />
                  )}
                  <button
                    onClick={togglePlay}
                    className="relative z-10 w-11 h-11 rounded-full bg-white text-black flex items-center justify-center shadow-xl spring-button"
                    title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
                  >
                    {isPlaying ? (
                      <Pause className="w-5 h-5 fill-current animate-button-pop" />
                    ) : (
                      <Play className="w-5 h-5 fill-current translate-x-0.5 animate-button-pop" />
                    )}
                  </button>
                </div>

                <button
                  onClick={skipNext}
                  className="p-2 text-white/65 hover:text-white spring-button"
                  title="Next (Arrow Right)"
                >
                  <SkipForward className="w-5 h-5 fill-current" />
                </button>

                <button
                  onClick={cycleRepeatMode}
                  className={`p-2 rounded-full spring-button relative ${
                    repeatMode !== 'off' ? 'text-[#fa2d48]' : 'text-white/40 hover:text-white'
                  }`}
                  title={`Repeat: ${repeatMode}`}
                >
                  <Repeat className="w-4 h-4" />
                  {repeatMode === 'one' && (
                    <span className="absolute top-0 right-0 text-[8px] font-bold">1</span>
                  )}
                  {repeatMode === 'all' && (
                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#fa2d48]" />
                  )}
                </button>
              </div>

              {/* Step 4: Razor-Thin 4px Scrubber with Dynamic Expanding Glow on Hover */}
              <div className="w-full flex items-center gap-3">
                <span className="text-xs font-mono tabular-nums text-white/40 w-10 text-right shrink-0">
                  {formatTime(currentTime)}
                </span>

                {/* Interactive Scrubber Track (Razor 4px at rest, expands to 8px on hover) */}
                <div 
                  ref={progressBarRef}
                  onClick={handleProgressClick}
                  onMouseDown={() => setIsScrubbing(true)}
                  onMouseUp={() => setIsScrubbing(false)}
                  onMouseMove={handleProgressMouseMove}
                  onMouseLeave={() => {
                    handleProgressMouseLeave();
                    setIsScrubbing(false);
                  }}
                  className="relative group flex-1 h-4 flex items-center cursor-pointer select-none"
                >
                  {/* Dynamic Canvas Particles & Fluid Wave Scrubber Visualizer */}
                  <CanvasWaveScrubber
                    isPlaying={isPlaying}
                    percentPlayed={percentPlayed}
                    primaryColor={primaryColor}
                    isHovered={hoverTime !== null}
                    isScrubbing={isScrubbing}
                  />

                  {/* Background Track: razor-thin 4px (h-1), expands on group-hover */}
                  <div className="w-full h-1 group-hover:h-2 rounded-full bg-white/[0.14] overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] relative">
                    {/* Buffered Progress */}
                    <div
                      className="absolute inset-y-0 left-0 bg-white/20 transition-all duration-200"
                      style={{ width: `${buffered}%` }}
                    />
                    
                    {/* Played Progress with Liquid Shimmer & Radiant Glow */}
                    <div
                      className={`absolute inset-y-0 left-0 rounded-full transition-all duration-75 ${
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

                    {/* Subtle Wave Pulse on playback */}
                    {isPlaying && (
                      <div 
                        className="absolute inset-0 opacity-40 mix-blend-overlay pointer-events-none"
                        style={{
                          backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 4px, rgba(255,255,255,0.4) 4px, rgba(255,255,255,0.4) 6px)'
                        }}
                      />
                    )}
                  </div>

                  {/* Glowing Thumb Circle: expands and glows brightly on active hover/drag */}
                  <div 
                    className={`absolute w-3 h-3 rounded-full bg-white pointer-events-none -translate-x-1/2 transition-all duration-200 ease-out ${
                      isScrubbing || isPlaying 
                        ? 'opacity-100 scale-110' 
                        : 'opacity-0 group-hover:opacity-100 group-hover:scale-100'
                    }`}
                    style={{ 
                      left: `${percentPlayed}%`,
                      boxShadow: `0 0 12px ${primaryColor}, 0 0 2px #ffffff`
                    }}
                  />

                  {/* Hover timestamp tooltip */}
                  {hoverTime !== null && (
                    <div 
                      className="absolute -top-7 px-2 py-0.5 rounded-lg bg-black/90 border border-white/15 text-[10px] font-mono tabular-nums text-white pointer-events-none -translate-x-1/2 shadow-xl animate-in fade-in"
                      style={{ left: `${hoverX}px` }}
                    >
                      {formatTime(hoverTime)}
                    </div>
                  )}
                </div>

                <span className="text-xs font-mono tabular-nums text-white/40 w-10 text-left shrink-0">
                  {formatRemainingTime(currentTime, duration)}
                </span>
              </div>

              {/* Master Audio Spec Pill & Speed Menu */}
              <div className="flex items-center justify-center gap-2 mt-1.5">
                <button
                  onClick={() => {
                    triggerHaptic('heavy');
                    setIsAudioQualityModalOpen(true);
                  }}
                  className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full border text-[10px] font-mono font-bold transition-all spring-button cursor-pointer ${
                    soundQualityMode === 'hi-res-lossless'
                      ? 'bg-amber-500/15 border-amber-400/50 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                      : soundQualityMode === 'cd-lossless'
                      ? 'bg-emerald-500/15 border-emerald-400/50 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                      : soundQualityMode === 'dolby-atmos'
                      ? 'bg-purple-500/15 border-purple-400/50 text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.3)]'
                      : 'bg-white/[0.06] hover:bg-white/[0.12] border-white/10 text-white/70 hover:text-white'
                  }`}
                  title="Audiophile Quality Specs & Bitrate Switcher"
                >
                  <Sparkles className="w-2.5 h-2.5" />
                  <span className="tracking-wider uppercase text-[9px]">
                    {soundQualityMode === 'hi-res-lossless' ? 'Hi-Res 24-Bit / 192kHz' :
                     soundQualityMode === 'cd-lossless' ? 'CD Lossless 16-Bit' :
                     soundQualityMode === 'dolby-atmos' ? 'Dolby Atmos Spatial' :
                     'Lossless AAC 320kbps'}
                  </span>
                </button>

                {/* Playback Speed Switcher Popover */}
                <div className="relative">
                  <button
                    onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-mono transition-all spring-button ${
                      playbackSpeed !== 1.0 
                        ? 'bg-sky-500/20 text-sky-400 border-sky-500/30' 
                        : 'bg-white/[0.06] text-white/65 border-white/10 hover:text-white'
                    }`}
                    title="Playback Speed & Tempo"
                  >
                    <Gauge className="w-2.5 h-2.5 text-sky-400" />
                    <span>{playbackSpeed}x</span>
                  </button>

                  {showSpeedMenu && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-36 glass-dock border border-white/15 rounded-2xl p-1.5 shadow-2xl backdrop-blur-2xl z-50 text-xs animate-in fade-in zoom-in-95">
                      <div className="px-2 py-1 font-bold text-white/65 text-[10px] uppercase tracking-wider border-b border-white/10">
                        Speed / Tempo
                      </div>
                      <div className="mt-1 space-y-0.5">
                        {SPEED_OPTIONS.map(opt => (
                          <button
                            key={opt.val}
                            onClick={() => {
                              setPlaybackSpeed(opt.val);
                              setShowSpeedMenu(false);
                            }}
                            className={`w-full text-left px-2 py-1 rounded-lg transition-colors flex items-center justify-between text-xs ${
                              playbackSpeed === opt.val 
                                ? 'bg-sky-500 text-white font-bold' 
                                : 'text-white/65 hover:bg-white/10 hover:text-white'
                            }`}
                          >
                            <span>{opt.label}</span>
                            {playbackSpeed === opt.val && <Check className="w-3 h-3" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Actions, Lyrics, Queue, EQ, Volume, Sleep Timer */}
            <div className="flex items-center justify-end gap-2 w-1/4">
              {/* Visualizer miniature toggle */}
              <button
                onClick={() => setShowMiniVisualizer(!showMiniVisualizer)}
                className={`p-2 rounded-xl spring-button ${
                  showMiniVisualizer ? 'bg-white/15 text-[#fa2d48]' : 'text-white/40 hover:text-white hover:bg-white/10'
                }`}
                title="Toggle Live Visualizer"
              >
                <Activity className="w-4 h-4" />
              </button>

              {/* Time-Synced Lyrics Toggle */}
              <button
                onClick={() => setIsLyricsOpen(prev => !prev)}
                className={`p-2 rounded-xl spring-button ${
                  isLyricsOpen ? 'bg-white/20 text-[#fa2d48] shadow-md' : 'text-white/40 hover:text-white hover:bg-white/10'
                }`}
                title="Time-Synced Lyrics (L)"
              >
                <Mic2 className="w-4 h-4" />
              </button>

              {/* Queue Toggle */}
              <button
                onClick={() => setIsQueueOpen(prev => !prev)}
                className={`p-2 rounded-xl spring-button relative ${
                  isQueueOpen ? 'bg-white/20 text-[#fa2d48]' : 'text-white/40 hover:text-white hover:bg-white/10'
                }`}
                title="Up Next Queue"
              >
                <ListMusic className="w-4 h-4" />
                {queue.length > 0 && (
                  <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#fa2d48]" />
                )}
              </button>

              {/* Equalizer Toggle */}
              <button
                onClick={() => setIsEqualizerOpen(prev => !prev)}
                className={`p-2 rounded-xl spring-button ${
                  isEqualizerOpen ? 'bg-white/20 text-[#fa2d48]' : 'text-white/40 hover:text-white hover:bg-white/10'
                }`}
                title="Audiophile Equalizer & DSP"
              >
                <Sliders className="w-4 h-4" />
              </button>

              {/* Sleep Timer Popover */}
              <div className="relative">
                <button
                  onClick={() => setShowSleepTimerMenu(!showSleepTimerMenu)}
                  className={`p-2 rounded-xl spring-button relative ${
                    sleepTimerMinutes !== null ? 'bg-purple-500/20 text-purple-400' : 'text-white/40 hover:text-white hover:bg-white/10'
                  }`}
                  title={sleepTimerMinutes ? `Sleep timer: ${formatTimer(sleepTimerRemaining)}` : 'Sleep Timer'}
                >
                  <Moon className="w-4 h-4" />
                  {sleepTimerMinutes !== null && (
                    <span className="absolute -top-1 -right-1 px-1 rounded-full bg-purple-500 text-[8px] font-bold text-white tabular-nums">
                      {formatTimer(sleepTimerRemaining)}
                    </span>
                  )}
                </button>

                {showSleepTimerMenu && (
                  <div className="absolute bottom-full right-0 mb-2 w-44 glass-dock border border-white/15 rounded-2xl p-2 shadow-2xl backdrop-blur-2xl z-50 text-xs animate-in fade-in zoom-in-95">
                    <div className="px-2 py-1 font-bold text-white/65 text-[10px] uppercase tracking-wider border-b border-white/10">
                      Sleep Timer
                    </div>
                    <div className="mt-1 space-y-1">
                      {[15, 30, 45, 60].map(mins => (
                        <button
                          key={mins}
                          onClick={() => {
                            setSleepTimer(mins);
                            setShowSleepTimerMenu(false);
                          }}
                          className={`w-full text-left px-2 py-1 rounded-lg transition-colors flex items-center justify-between ${
                            sleepTimerMinutes === mins 
                              ? 'bg-purple-600 text-white font-bold' 
                              : 'text-white/65 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          <span>{mins} minutes</span>
                          {sleepTimerMinutes === mins && <Check className="w-3 h-3" />}
                        </button>
                      ))}
                      {sleepTimerMinutes !== null && (
                        <button
                          onClick={() => {
                            setSleepTimer(null);
                            setShowSleepTimerMenu(false);
                          }}
                          className="w-full text-left px-2 py-1 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          Turn Off Timer
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Volume Slider & Mute Toggle */}
              <div className="flex items-center gap-2 pl-2 border-l border-white/10">
                <button
                  onClick={toggleMute}
                  className="p-1.5 text-white/50 hover:text-white spring-button"
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-4 h-4 text-red-400" />
                  ) : volume < 0.5 ? (
                    <Volume1 className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </button>

                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={isMuted ? 0 : volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-20 h-1 accent-[#fa2d48]"
                  title={`Volume: ${Math.round((isMuted ? 0 : volume) * 100)}%`}
                />
              </div>

              {/* Dynamic Island Float Toggle */}
              <button
                onClick={() => {
                  triggerHaptic('medium');
                  if (isIslandActive) {
                    dismissIsland();
                  } else {
                    minimizeToIsland();
                  }
                }}
                className={`p-2 rounded-xl spring-button ${
                  isIslandActive ? 'bg-[#fa2d48] text-white shadow-md' : 'text-white/40 hover:text-white hover:bg-white/10'
                }`}
                title={isIslandActive ? 'Dismiss Dynamic Island' : 'Float Dynamic Island'}
              >
                <Minimize2 className="w-4 h-4" />
              </button>

              {/* Fullscreen Expand */}
              <button
                onClick={() => setIsFullscreen(true)}
                className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/10 spring-button ml-1"
                title="Fullscreen Player (F)"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Mini Live Audio Spectrum Strip when toggled */}
          {showMiniVisualizer && (
            <div className="pt-2 mt-2 border-t border-white/10 flex items-center justify-center">
              <AudioVisualizer className="w-full max-w-2xl h-8" barCount={48} mode="wave" />
            </div>
          )}
        </div>
      </footer>
    </>
  );
};
