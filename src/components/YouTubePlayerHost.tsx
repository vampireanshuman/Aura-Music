import React, { useState } from 'react';
import { useAudio } from '../context/AudioContext';
import { Video, X, Maximize2, Minimize2 } from 'lucide-react';

export const YouTubePlayerHost: React.FC = () => {
  const { currentTrack } = useAudio();
  const [isVideoVisible, setIsVideoVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const youtubeId = currentTrack?.youtubeId || (currentTrack?.id.startsWith('yt-') ? currentTrack.id.replace('yt-', '') : null);

  if (!youtubeId) return null;

  return (
    <>
      {/* Floating Picture-in-Picture Music Video Player */}
      {isVideoVisible && (
        <div 
          className={`fixed z-50 transition-all duration-300 shadow-2xl overflow-hidden border border-white/20 bg-black/95 flex flex-col ${
            isExpanded
              ? 'inset-4 sm:inset-12 rounded-3xl p-4 backdrop-blur-2xl'
              : 'bottom-24 right-4 sm:right-8 w-72 sm:w-84 h-48 sm:h-52 rounded-2xl'
          }`}
        >
          <div className="flex items-center justify-between px-3 py-2 bg-black/80 border-b border-white/10 shrink-0">
            <div className="flex items-center gap-1.5 text-xs text-white/90 font-medium truncate">
              <Video className="w-3.5 h-3.5 text-[#fa2d48]" />
              <span className="truncate">{currentTrack?.title}</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1 rounded text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                title={isExpanded ? 'Minimize' : 'Expand'}
              >
                {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setIsVideoVisible(false)}
                className="p-1 rounded text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                title="Close Video"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="flex-1 w-full h-full relative bg-black">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&playsinline=1&modestbranding=1&rel=0`}
              title={currentTrack?.title || 'Music Video'}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}

      {/* Floating Toggle Pill button in bottom corner when playing YouTube track */}
      {!isVideoVisible && (
        <button
          onClick={() => setIsVideoVisible(true)}
          className="fixed bottom-24 right-4 sm:right-6 z-30 px-3 py-1.5 rounded-full bg-black/80 hover:bg-black/95 border border-white/20 hover:border-white/40 text-xs text-white/80 hover:text-white shadow-xl backdrop-blur-md flex items-center gap-1.5 transition-all group active:scale-95 cursor-pointer"
          title="Watch official music video"
        >
          <Video className="w-3.5 h-3.5 text-[#fa2d48] group-hover:scale-110 transition-transform" />
          <span className="font-semibold text-[11px] tracking-tight">Watch Video</span>
        </button>
      )}
    </>
  );
};
