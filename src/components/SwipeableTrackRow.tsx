import React, { useState, useRef } from 'react';
import type { Track } from '../types/music';
import { Play, Heart, ListPlus, Check } from 'lucide-react';
import { AnimatedSoundBars } from './AnimatedSoundBars';
import { get4kArtworkUrl, handleArtworkError } from '../utils/artworkUtils';
import { formatTime } from '../utils/formatTime';
import { triggerHaptic } from '../utils/haptics';
import { TrackActionMenu } from './TrackActionMenu';
import { showIslandToast } from '../utils/islandToast';

interface SwipeableTrackRowProps {
  track: Track;
  index: number;
  isCurrent: boolean;
  isPlaying: boolean;
  primaryColor: string;
  isLiked?: boolean;
  onPlay: () => void;
  onPlayNext: (track: Track) => void;
  onToggleFavorite?: (e: React.MouseEvent, track: Track) => void;
  showAlbum?: boolean;
  showGenre?: boolean;
}

export const SwipeableTrackRow: React.FC<SwipeableTrackRowProps> = ({
  track,
  index,
  isCurrent,
  isPlaying,
  primaryColor,
  isLiked = false,
  onPlay,
  onPlayNext,
  onToggleFavorite,
  showAlbum = true,
  showGenre = true,
}) => {
  const [swipeX, setSwipeX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [justQueued, setJustQueued] = useState(false);
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const isHorizontalSwipeRef = useRef<boolean | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
    isHorizontalSwipeRef.current = null;
    setIsSwiping(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null || touchStartYRef.current === null) return;
    const deltaX = e.touches[0].clientX - touchStartXRef.current;
    const deltaY = e.touches[0].clientY - touchStartYRef.current;

    // Detect if horizontal swipe or vertical page scroll
    if (isHorizontalSwipeRef.current === null) {
      if (Math.abs(deltaX) > 8 || Math.abs(deltaY) > 8) {
        isHorizontalSwipeRef.current = Math.abs(deltaX) > Math.abs(deltaY);
      }
    }

    if (!isHorizontalSwipeRef.current) return;

    // Only allow swiping right (positive deltaX)
    if (deltaX > 0) {
      setIsSwiping(true);
      // Soft rubber-band resistance beyond 85px
      const resistanceX = deltaX > 85 ? 85 + (deltaX - 85) * 0.35 : deltaX;
      setSwipeX(Math.min(120, resistanceX));
    }
  };

  const handleTouchEnd = () => {
    if (touchStartXRef.current === null) return;

    if (swipeX >= 55) {
      // Trigger Quick Queue!
      onPlayNext(track);
      triggerHaptic('medium');
      setJustQueued(true);
      showIslandToast(`Queued Next: ${track.title}`);
      setTimeout(() => setJustQueued(false), 1600);
    }

    // Spring snap-back to 0px
    setSwipeX(0);
    setIsSwiping(false);
    touchStartXRef.current = null;
    touchStartYRef.current = null;
    isHorizontalSwipeRef.current = null;
  };

  const handleRowClick = () => {
    // Only trigger play if not actively swiping
    if (swipeX < 10) {
      onPlay();
    }
  };

  return (
    <div className="relative overflow-hidden rounded-xl my-0.5 select-none">
      {/* Swipe Reveal Underlay: Glowing "Play Next" / "Queue" Icon & Pill */}
      <div 
        className="absolute inset-y-0 left-0 flex items-center px-4 rounded-xl transition-opacity duration-200"
        style={{
          width: '100%',
          background: justQueued 
            ? 'linear-gradient(90deg, rgba(16, 185, 129, 0.45) 0%, rgba(16, 185, 129, 0.1) 60%, transparent 100%)'
            : `linear-gradient(90deg, ${primaryColor}55 0%, ${primaryColor}15 50%, transparent 100%)`,
          opacity: swipeX > 15 || justQueued ? 1 : 0
        }}
      >
        <div 
          className="flex items-center gap-2 text-white font-bold text-xs"
          style={{
            transform: `scale(${Math.min(1.15, 0.85 + (swipeX / 90) * 0.3)})`,
            transition: isSwiping ? 'none' : 'transform 0.3s ease'
          }}
        >
          {justQueued ? (
            <>
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-black flex items-center justify-center shadow-lg">
                <Check className="w-4 h-4 stroke-[3]" />
              </div>
              <span className="text-emerald-300 font-extrabold tracking-tight">Queued Next</span>
            </>
          ) : (
            <>
              <div 
                className="w-8 h-8 rounded-full text-white flex items-center justify-center shadow-lg"
                style={{ backgroundColor: primaryColor }}
              >
                <ListPlus className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span className="font-extrabold tracking-tight text-white/90">
                {swipeX >= 55 ? 'Release to Queue Next' : 'Swipe to Queue'}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Foreground Track Row Container */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleRowClick}
        style={{
          transform: `translate3d(${swipeX}px, 0, 0)`,
          transition: isSwiping 
            ? 'none' 
            : 'transform 0.42s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.2s ease, border-color 0.2s ease',
          background: isCurrent 
            ? 'rgba(255, 255, 255, 0.07)' 
            : undefined
        }}
        className={`group relative flex items-center justify-between p-2.5 sm:p-3 rounded-xl hover:bg-white/[0.06] transition-colors cursor-pointer border ${
          isCurrent 
            ? 'border-white/15 shadow-[0_4px_20px_rgba(0,0,0,0.35)]' 
            : 'border-transparent'
        }`}
      >
        {/* Left Section: Index / SoundBars + Artwork + Title & Artist */}
        <div className="flex items-center gap-3 sm:gap-3.5 min-w-0 flex-1">
          {/* Index or Live AnimatedSoundBars */}
          <div className="w-6 shrink-0 flex items-center justify-center">
            {isCurrent ? (
              <AnimatedSoundBars isPlaying={isPlaying} color={primaryColor} size="sm" />
            ) : (
              <>
                <span className="text-xs font-mono tabular-nums text-white/40 group-hover:hidden">
                  {index + 1}
                </span>
                <button className="hidden group-hover:flex items-center justify-center text-white spring-button">
                  <Play className="w-4 h-4 fill-current" />
                </button>
              </>
            )}
          </div>

          {/* 40x40 Thumbnail with Glow & 1:1 Aspect */}
          <div className="relative w-10 h-10 shrink-0">
            <img
              src={get4kArtworkUrl(track)}
              onError={handleArtworkError}
              alt={track.title}
              className="w-10 h-10 rounded-lg object-cover object-center scale-[1.08] shadow-md ring-1 ring-white/10"
            />
          </div>

          {/* Title & Artist/Album */}
          <div className="min-w-0 flex-1 pr-2">
            <h4 
              className={`text-sm font-bold tracking-tight truncate transition-colors ${
                isCurrent ? 'font-extrabold' : 'text-white'
              }`}
              style={{ color: isCurrent ? primaryColor : undefined }}
            >
              {track.title}
            </h4>
            <p className="text-xs text-white/65 font-medium truncate mt-0.5">
              {track.artist} {showAlbum && track.album ? `• ${track.album}` : ''}
            </p>
          </div>
        </div>

        {/* Right Section: Genre + Duration + Favorite + Actions */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          {showGenre && track.genre && (
            <span className="hidden md:block text-xs font-medium text-white/40">
              {track.genre}
            </span>
          )}
          <span className="text-xs font-mono tabular-nums text-white/45">
            {formatTime(track.duration)}
          </span>

          {onToggleFavorite && (
            <button
              onClick={(e) => onToggleFavorite(e, track)}
              className="p-1.5 text-white/40 hover:text-white spring-button"
              title={isLiked ? 'Remove from Favorites' : 'Add to Favorites'}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-[#fa2d48] text-[#fa2d48]' : ''}`} />
            </button>
          )}

          <div onClick={(e) => e.stopPropagation()}>
            <TrackActionMenu track={track} />
          </div>
        </div>
      </div>
    </div>
  );
};
