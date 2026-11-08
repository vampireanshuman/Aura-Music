import React from 'react';
import { useAudio } from '../context/AudioContext';
import { X, Trash2, Play, Music, ListMusic, Sparkles } from 'lucide-react';
import { formatTime } from '../utils/formatTime';
import { AnimatedSoundBars } from './AnimatedSoundBars';
import { get4kArtworkUrl, handleArtworkError } from '../utils/artworkUtils';

export const QueueDrawer: React.FC = () => {
  const { 
    queue, 
    queueIndex, 
    currentTrack, 
    isPlaying, 
    playTrack, 
    removeFromQueue, 
    clearQueue, 
    isQueueOpen, 
    setIsQueueOpen 
  } = useAudio();

  if (!isQueueOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={() => setIsQueueOpen(false)}
      />

      {/* Drawer */}
      <div className="relative z-10 w-full max-w-md h-full bg-[#12141f]/95 border-l border-white/10 shadow-2xl backdrop-blur-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <ListMusic className="w-5 h-5 text-[#fa2d48]" />
            <h3 className="text-lg font-bold text-white tracking-tight">Playing Next</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/70 font-mono">
              {queue.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {queue.length > 1 && (
              <button
                onClick={clearQueue}
                className="text-xs text-white/50 hover:text-white px-2.5 py-1 rounded-md hover:bg-white/10 transition-colors flex items-center gap-1.5"
                title="Clear upcoming queue"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear
              </button>
            )}
            <button
              onClick={() => setIsQueueOpen(false)}
              className="p-1.5 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Now Playing Card */}
          {currentTrack && (
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-white/40 px-2 block mb-2">
                Now Playing
              </span>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.08] border border-white/10">
                <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 group">
                  <img
                    src={get4kArtworkUrl(currentTrack)}
                    onError={handleArtworkError}
                    alt={currentTrack.title}
                    className="w-full h-full object-cover"
                  />
                  {isPlaying && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center">
                      <AnimatedSoundBars isPlaying={true} color="#ffffff" size="sm" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-white truncate">
                    {currentTrack.title}
                  </h4>
                  <p className="text-xs text-white/60 truncate">
                    {currentTrack.artist}
                  </p>
                </div>
                <span className="text-xs font-mono text-white/40">
                  {formatTime(currentTrack.duration)}
                </span>
              </div>
            </div>
          )}

          {/* Up Next List */}
          <div>
            <div className="flex items-center justify-between mb-2 px-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-white/40 block">
                Next in Queue
              </span>
              <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Infinite Smart Radio
              </span>
            </div>

            {queue.length <= 1 ? (
              <div className="py-12 text-center text-white/40 space-y-2">
                <Music className="w-8 h-8 mx-auto text-white/20" />
                <p className="text-sm">Queue is empty</p>
                <p className="text-xs text-white/30">Smart Radio will automatically autoplay similar music</p>
              </div>
            ) : (
              <div className="space-y-1">
                {queue.map((track, idx) => {
                  if (idx === queueIndex) return null; // Already shown in Now Playing
                  return (
                    <div
                      key={`${track.id}-${idx}`}
                      className="group flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/[0.06] transition-colors"
                    >
                      <span className="w-5 text-center text-xs font-mono text-white/30 group-hover:hidden">
                        {idx + 1}
                      </span>
                      <button
                        onClick={() => playTrack(track)}
                        className="w-5 h-5 hidden group-hover:flex items-center justify-center text-white"
                        title="Play now"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                      </button>

                      <img
                        src={get4kArtworkUrl(track)}
                        onError={handleArtworkError}
                        alt={track.title}
                        className="w-10 h-10 rounded-lg object-cover shrink-0"
                      />

                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-white truncate group-hover:text-[#fa2d48] transition-colors">
                          {track.title}
                        </h4>
                        <p className="text-xs text-white/50 truncate">
                          {track.artist}
                        </p>
                      </div>

                      <span className="text-xs font-mono text-white/40">
                        {formatTime(track.duration)}
                      </span>

                      <button
                        onClick={() => removeFromQueue(idx)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md hover:bg-white/10 text-white/40 hover:text-red-400 transition-all"
                        title="Remove from queue"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
