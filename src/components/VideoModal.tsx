import React, { useEffect, useState } from 'react';
import { useAudio } from '../context/AudioContext';
import { X, ExternalLink, Video, Sparkles } from 'lucide-react';
import { SyncedNativeVideoPlayer } from './SyncedNativeVideoPlayer';
import { getApiUrl } from '../utils/apiConfig';

export const VideoModal: React.FC = () => {
  const {
    isVideoModalOpen,
    setIsVideoModalOpen,
    currentTrack,
    pauseAudioForVideo,
    resumeAudioAfterVideo
  } = useAudio();

  const [resolvedVideoId, setResolvedVideoId] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    let active = true;
    if (isVideoModalOpen && currentTrack) {
      pauseAudioForVideo();
      const rawId = currentTrack.youtubeId || (currentTrack.id.startsWith('yt-') ? currentTrack.id.replace('yt-', '') : null);
      if (rawId) {
        setResolvedVideoId(rawId);
      } else {
        setIsSearching(true);
        fetch(getApiUrl(`/api/search?q=${encodeURIComponent(currentTrack.artist + ' ' + currentTrack.title + ' official music video')}`))
          .then(res => res.json())
          .then(data => {
            if (active && data.tracks?.[0]?.youtubeId) {
              setResolvedVideoId(data.tracks[0].youtubeId);
            }
          })
          .catch(() => {})
          .finally(() => {
            if (active) setIsSearching(false);
          });
      }
    }

    return () => {
      active = false;
    };
  }, [isVideoModalOpen, currentTrack]);

  if (!isVideoModalOpen || !currentTrack) return null;

  const handleClose = () => {
    setIsVideoModalOpen(false);
    resumeAudioAfterVideo();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/95 backdrop-blur-3xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-neutral-950 border border-white/20 rounded-[32px] overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.9)] flex flex-col max-h-[92vh]">
        
        {/* Modal Top Header */}
        <div className="p-3 sm:p-4 bg-neutral-900/90 border-b border-white/10 flex items-center justify-between z-10">
          <div className="flex items-center gap-2.5 min-w-0 pr-3">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping shrink-0" />
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-white truncate">
                {currentTrack.title} — {currentTrack.artist}
              </h3>
              <p className="text-[11px] text-white/50 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-purple-400" />
                <span>Native 4K / HD Video Cinema • Zero YouTube Ads & No Redirects</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {resolvedVideoId && (
              <a
                href={`https://www.youtube.com/watch?v=${resolvedVideoId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs items-center gap-1.5 transition-colors"
                title="Watch on YouTube Web"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open Link</span>
              </a>
            )}
            <button
              onClick={handleClose}
              className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors"
              title="Close Cinema (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Frame */}
        <div className="relative w-full aspect-video bg-black flex items-center justify-center overflow-hidden">
          {resolvedVideoId ? (
            <SyncedNativeVideoPlayer
              videoId={resolvedVideoId}
              title={currentTrack.title}
              artist={currentTrack.artist}
              syncWithAudio={true}
              onClose={handleClose}
            />
          ) : (
            <div className="text-center p-8 text-white/50 space-y-3">
              <Video className="w-12 h-12 mx-auto text-purple-400 animate-pulse" />
              <h4 className="text-lg font-bold text-white">
                {isSearching ? 'Resolving Official Music Video...' : 'Preparing Stream...'}
              </h4>
              <p className="text-xs text-white/40 max-w-sm">
                Fetching high-definition direct stream for {currentTrack.title}
              </p>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-neutral-900/90 border-t border-white/10 flex items-center justify-between text-xs text-white/50">
          <span className="hidden sm:inline">Double tap left/right to skip 10 seconds • Click PiP to float video</span>
          <button
            onClick={handleClose}
            className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition-colors ml-auto"
          >
            Return to Music Player
          </button>
        </div>
      </div>
    </div>
  );
};
