import React, { useState, useRef, useEffect } from 'react';
import { useAudio } from '../context/AudioContext';
import type { Track } from '../types/music';
import { 
  MoreVertical, 
  Play, 
  ListPlus, 
  Heart, 
  Video, 
  Share2, 
  Check, 
  FolderPlus
} from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';
import confetti from 'canvas-confetti';

interface TrackActionMenuProps {
  track: Track;
  className?: string;
}

export const TrackActionMenu: React.FC<TrackActionMenuProps> = ({ track, className = '' }) => {
  const { 
    playNext, 
    addToQueue, 
    toggleFavorite, 
    isFavorite, 
    playlists, 
    addTrackToPlaylist,
    setIsVideoModalOpen,
    currentTrack,
    playTrack,
    tracks
  } = useAudio();

  const [isOpen, setIsOpen] = useState(false);
  const [showPlaylistsSubmenu, setShowPlaylistsSubmenu] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const isLiked = isFavorite(track.id);

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setShowPlaylistsSubmenu(false);
      }
    };
    if (isOpen) {
      window.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      window.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/?track=${encodeURIComponent(track.title)}&artist=${encodeURIComponent(track.artist)}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl).then(() => {
        setCopiedLink(true);
        triggerHaptic('light');
        setTimeout(() => setCopiedLink(false), 2500);
      });
    }
  };

  const handlePlayNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    playNext(track);
    triggerHaptic('medium');
    setIsOpen(false);
  };

  const handleAddToQueue = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToQueue(track);
    triggerHaptic('light');
    setIsOpen(false);
  };

  const handleToggleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(track.id, track);
    if (!isLiked) {
      confetti({
        particleCount: 20,
        spread: 50,
        origin: { y: 0.7 },
        colors: ['#fa2d48', '#ec4899', '#f43f5e']
      });
    }
    triggerHaptic('success');
    setIsOpen(false);
  };

  const handleWatchVideo = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentTrack?.id !== track.id) {
      playTrack(track, tracks);
    }
    setIsVideoModalOpen(true);
    setIsOpen(false);
  };

  return (
    <div ref={menuRef} className={`relative ${className}`} onClick={(e) => e.stopPropagation()}>
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          triggerHaptic('selection');
        }}
        className="p-1.5 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-colors"
        title="More Actions"
        aria-label="More track options"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1.5 w-52 bg-[#12141f]/95 border border-white/15 rounded-2xl p-1.5 shadow-2xl backdrop-blur-2xl z-50 animate-in fade-in zoom-in-95 duration-150 text-xs">
          {/* Track Quick Header */}
          <div className="px-3 py-2 border-b border-white/10 mb-1">
            <h5 className="font-bold text-white truncate">{track.title}</h5>
            <p className="text-[11px] text-white/50 truncate mt-0.5">{track.artist}</p>
          </div>

          <div className="space-y-0.5">
            {/* Play Next */}
            <button
              onClick={handlePlayNext}
              className="w-full text-left px-3 py-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 flex items-center gap-2.5 transition-colors font-medium"
            >
              <Play className="w-3.5 h-3.5 text-emerald-400" />
              <span>Play Next in Queue</span>
            </button>

            {/* Add to Queue */}
            <button
              onClick={handleAddToQueue}
              className="w-full text-left px-3 py-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 flex items-center gap-2.5 transition-colors font-medium"
            >
              <ListPlus className="w-3.5 h-3.5 text-sky-400" />
              <span>Add to Queue</span>
            </button>

            {/* Favorite / Like */}
            <button
              onClick={handleToggleLike}
              className="w-full text-left px-3 py-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 flex items-center gap-2.5 transition-colors font-medium"
            >
              <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-[#fa2d48] text-[#fa2d48]' : 'text-[#fa2d48]'}`} />
              <span>{isLiked ? 'Remove from Favorites' : 'Add to Favorites'}</span>
            </button>

            {/* Watch Official Video */}
            <button
              onClick={handleWatchVideo}
              className="w-full text-left px-3 py-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 flex items-center gap-2.5 transition-colors font-medium"
            >
              <Video className="w-3.5 h-3.5 text-purple-400" />
              <span>Watch Official HD Video</span>
            </button>

            {/* Add to Playlist Submenu Trigger */}
            <div className="relative">
              <button
                onClick={() => setShowPlaylistsSubmenu(!showPlaylistsSubmenu)}
                className="w-full text-left px-3 py-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 flex items-center justify-between transition-colors font-medium"
              >
                <div className="flex items-center gap-2.5">
                  <FolderPlus className="w-3.5 h-3.5 text-amber-400" />
                  <span>Add to Playlist...</span>
                </div>
                <span className="text-[10px] text-white/40">›</span>
              </button>

              {showPlaylistsSubmenu && (
                <div className="absolute left-full top-0 ml-1.5 w-48 bg-[#12141f]/95 border border-white/15 rounded-2xl p-1.5 shadow-2xl backdrop-blur-2xl z-50">
                  <div className="px-2 py-1 text-[10px] uppercase font-bold tracking-wider text-white/40 border-b border-white/10 mb-1">
                    Select Playlist
                  </div>
                  {playlists.length > 0 ? (
                    playlists.map(pl => (
                      <button
                        key={pl.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          addTrackToPlaylist(pl.id, track.id, track);
                          triggerHaptic('success');
                          setIsOpen(false);
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 text-xs truncate transition-colors block"
                      >
                        {pl.name}
                      </button>
                    ))
                  ) : (
                    <span className="text-[11px] text-white/40 px-2 py-1 block">No playlists created yet</span>
                  )}
                </div>
              )}
            </div>

            {/* Share Song */}
            <button
              onClick={handleShare}
              className="w-full text-left px-3 py-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 flex items-center gap-2.5 transition-colors font-medium"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-white/60" />}
              <span>{copiedLink ? 'Link Copied to Clipboard!' : 'Share Song Link'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
