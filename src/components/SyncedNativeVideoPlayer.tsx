import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useAudio } from '../context/AudioContext';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX,
  Maximize, 
  Minimize, 
  PictureInPicture, 
  Settings, 
  RefreshCw, 
  Sparkles, 
  Check, 
  AlertCircle, 
  Film, 
  Tv,
  X
} from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';
import { formatTime } from '../utils/formatTime';
import { getApiUrl } from '../utils/apiConfig';

interface SyncedNativeVideoPlayerProps {
  videoId: string;
  title: string;
  artist: string;
  syncWithAudio?: boolean;
  onClose?: () => void;
  className?: string;
}

export const SyncedNativeVideoPlayer: React.FC<SyncedNativeVideoPlayerProps> = ({
  videoId,
  title,
  artist,
  syncWithAudio = true,
  onClose,
  className = ''
}) => {
  const {
    currentTime,
    duration,
    isPlaying,
    togglePlay,
    seek,
    pauseAudioForVideo,
    resumeAudioAfterVideo,
    activeThemeColor
  } = useAudio();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isMetadataLoadedRef = useRef(false);
  const isSeekingRef = useRef(false);

  // Player mode: 'embed' for instantaneous HD playback, 'native' for direct stream proxy
  const [playerMode, setPlayerMode] = useState<'native' | 'embed'>('embed');
  const [quality, setQuality] = useState<'1080p' | '720p' | '480p'>('720p');
  const [isAudioMuted, setIsAudioMuted] = useState(false); // Play audio with video since studio audio is paused
  const [showControls, setShowControls] = useState(true);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [isBuffering, setIsBuffering] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isFullscreenVideo, setIsFullscreenVideo] = useState(false);
  const [doubleTapFeedback, setDoubleTapFeedback] = useState<'left' | 'right' | null>(null);

  const controlsTimeoutRef = useRef<number | null>(null);
  const bufferTimeoutRef = useRef<number | null>(null);
  const lastTapRef = useRef<number>(0);

  const primaryColor = activeThemeColor || '#fa2d48';
  const videoStreamSrc = getApiUrl(`/api/video-stream?id=${encodeURIComponent(videoId)}&quality=${quality}`);

  // Ensure studio audio is paused while video player is mounted, and resumed on unmount
  useEffect(() => {
    pauseAudioForVideo();
    return () => {
      resumeAudioAfterVideo();
    };
  }, [pauseAudioForVideo, resumeAudioAfterVideo]);

  // Reset controls timer
  const resetControlsTimer = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      window.clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = window.setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
        setShowSettingsMenu(false);
      }
    }, 3500);
  }, [isPlaying]);

  // Fallback to embedded cinema if native stream buffers for too long (>6 seconds)
  useEffect(() => {
    if (playerMode === 'native' && isBuffering && !hasError) {
      if (bufferTimeoutRef.current) window.clearTimeout(bufferTimeoutRef.current);
      bufferTimeoutRef.current = window.setTimeout(() => {
        if (isBuffering) {
          console.warn('Native video stream took too long, auto-switching to Cinema embed player');
          setPlayerMode('embed');
          setIsBuffering(false);
        }
      }, 6500);
    } else {
      if (bufferTimeoutRef.current) window.clearTimeout(bufferTimeoutRef.current);
    }
    return () => {
      if (bufferTimeoutRef.current) window.clearTimeout(bufferTimeoutRef.current);
    };
  }, [playerMode, isBuffering, hasError]);

  // Phase-Locked Loop (PLL) Audio-Video synchronization
  // Zero seek-storms: adjusts playback rate for small drift, only seeks on large drift
  useEffect(() => {
    if (playerMode !== 'native') return;
    const video = videoRef.current;
    if (!video || !syncWithAudio || !isMetadataLoadedRef.current || isSeekingRef.current) return;

    // Synchronize play/pause state
    if (isPlaying && video.paused) {
      video.play().catch(() => {});
    } else if (!isPlaying && !video.paused) {
      video.pause();
    }

    const drift = video.currentTime - currentTime;

    // Large drift (> 2.8s) or user explicit seek
    if (Math.abs(drift) > 2.8) {
      if (video.readyState >= 2 && !video.seeking) {
        video.currentTime = currentTime;
      }
    } 
    // Micro drift (0.3s - 2.8s): gently glide playback rate so video catches up without dropping chunks
    else if (Math.abs(drift) > 0.35 && isPlaying) {
      video.playbackRate = drift < 0 ? 1.08 : 0.92;
    } 
    // Synchronized within 0.35s: standard 1.0x speed
    else {
      video.playbackRate = 1.0;
    }
  }, [currentTime, isPlaying, syncWithAudio, playerMode]);

  // Handle video audio mute/unmute
  const toggleVideoAudio = () => {
    const video = videoRef.current;
    if (video) {
      video.muted = !video.muted;
      setIsAudioMuted(video.muted);
    } else {
      setIsAudioMuted(prev => !prev);
    }
    triggerHaptic('medium');
  };

  // Picture in Picture
  const handleTogglePiP = async () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (document.pictureInPictureEnabled) {
        await video.requestPictureInPicture();
        triggerHaptic('light');
      }
    } catch (err) {
      console.warn('PiP not supported or failed:', err);
    }
  };

  // Fullscreen video toggle
  const handleToggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen().then(() => setIsFullscreenVideo(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreenVideo(false)).catch(() => {});
    }
    triggerHaptic('light');
  };

  // Double tap to seek 10s forward or backward
  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const now = Date.now();
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const isLeftSide = clickX < rect.width / 2;

    if (now - lastTapRef.current < 300) {
      // Double tap detected
      if (isLeftSide) {
        seek(Math.max(0, currentTime - 10));
        setDoubleTapFeedback('left');
        triggerHaptic('selection');
      } else {
        seek(Math.min(duration, currentTime + 10));
        setDoubleTapFeedback('right');
        triggerHaptic('selection');
      }
      setTimeout(() => setDoubleTapFeedback(null), 600);
      lastTapRef.current = 0;
      return;
    }

    lastTapRef.current = now;
    resetControlsTimer();
  };

  const handleRetry = () => {
    setHasError(false);
    setIsBuffering(true);
    if (playerMode === 'native') {
      const video = videoRef.current;
      if (video) {
        video.load();
        video.play().catch(() => {});
      }
    }
  };

  return (
    <div
      ref={containerRef}
      onClick={handleContainerClick}
      onMouseMove={resetControlsTimer}
      className={`relative w-full h-full bg-black rounded-3xl overflow-hidden shadow-2xl flex items-center justify-center select-none group ${className}`}
    >
      {/* MODE 1: Native HTML5 Video Element with Direct 4K/HD Stream */}
      {playerMode === 'native' ? (
        <video
          ref={videoRef}
          src={videoStreamSrc}
          playsInline
          muted={isAudioMuted}
          autoPlay={isPlaying}
          onLoadedMetadata={() => {
            isMetadataLoadedRef.current = true;
            if (videoRef.current && currentTime > 0) {
              videoRef.current.currentTime = currentTime;
            }
          }}
          onSeeking={() => { isSeekingRef.current = true; }}
          onSeeked={() => { isSeekingRef.current = false; }}
          onWaiting={() => setIsBuffering(true)}
          onPlaying={() => {
            setIsBuffering(false);
            setHasError(false);
          }}
          onError={(e) => {
            console.warn('Native video playback error, failing over to Cinema Embed:', e);
            setErrorMessage('Direct 4K stream taking time. Active on Cinema player.');
            setPlayerMode('embed');
            setIsBuffering(false);
          }}
          className="w-full h-full object-contain pointer-events-none"
        />
      ) : (
        /* MODE 2: In-App Cinema Embed Player (Zero YouTube ads, zero popups, zero redirect) */
        <div className="w-full h-full relative bg-black flex items-center justify-center pointer-events-auto">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=${isAudioMuted ? 1 : 0}&controls=1&playsinline=1&modestbranding=1&rel=0&start=${Math.floor(currentTime)}`}
            title={title}
            className="w-full h-full border-0 pointer-events-auto"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      )}

      {/* Buffering Indicator */}
      {isBuffering && !hasError && playerMode === 'native' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-none z-20 animate-in fade-in duration-200">
          <div className="relative w-14 h-14 flex items-center justify-center">
            <span 
              className="absolute inset-0 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: `${primaryColor} transparent transparent transparent` }}
            />
            <Sparkles className="w-6 h-6 animate-pulse" style={{ color: primaryColor }} />
          </div>
          <span className="text-xs font-semibold text-white/80 mt-3 tracking-wide">
            Connecting Studio HD Video Stream...
          </span>
        </div>
      )}

      {/* Error / Fallback State */}
      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/85 p-6 text-center z-20 animate-in fade-in duration-200">
          <AlertCircle className="w-12 h-12 text-amber-400 mb-3" />
          <h4 className="text-base font-bold text-white mb-1">Direct Stream Reconnecting</h4>
          <p className="text-xs text-white/60 max-w-sm mb-4">
            {errorMessage || 'Switching to high-performance cinema player...'}
          </p>
          <div className="flex items-center gap-3 pointer-events-auto">
            <button
              onClick={() => setPlayerMode('embed')}
              className="px-4 py-2 rounded-xl bg-white text-black font-bold text-xs flex items-center gap-1.5 shadow-lg active:scale-95 transition-transform"
            >
              <Tv className="w-3.5 h-3.5" />
              <span>Use Cinema Player</span>
            </button>
            <button
              onClick={handleRetry}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Stream</span>
            </button>
          </div>
        </div>
      )}

      {/* Double Tap Seek Feedback Ripple */}
      {doubleTapFeedback && (
        <div className={`absolute inset-y-0 ${doubleTapFeedback === 'left' ? 'left-0 pr-12' : 'right-0 pl-12'} w-1/3 flex items-center justify-center bg-white/10 backdrop-blur-sm z-30 pointer-events-none animate-in fade-in zoom-in duration-200 rounded-3xl`}>
          <span className="text-sm font-extrabold text-white">
            {doubleTapFeedback === 'left' ? '-10s' : '+10s'}
          </span>
        </div>
      )}

      {/* Interactive Controls Overlay - Always pointer-events-none so iframe is clickable, children opt-in */}
      <div
        className={`absolute inset-0 flex flex-col justify-between p-4 bg-gradient-to-t from-black/85 via-transparent to-black/70 transition-opacity duration-300 z-10 pointer-events-none ${
          showControls || !isPlaying ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between pointer-events-auto">
          <div className="flex items-center gap-2.5 min-w-0 pr-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping shrink-0" />
            <div className="min-w-0">
              <h4 className="text-sm font-bold text-white truncate drop-shadow">
                {title}
              </h4>
              <p className="text-[11px] text-white/70 truncate">
                {artist} • {playerMode === 'native' ? `${quality.toUpperCase()} Direct 4K` : 'HD Cinema Stream'}
              </p>
            </div>
          </div>

          {/* Top Actions: Stream Engine Toggle, Audio Source, Quality, PiP, Fullscreen */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Stream Engine Toggle (Direct HD vs Cinema Embed) */}
            <button
              onClick={() => {
                setPlayerMode(prev => prev === 'native' ? 'embed' : 'native');
                triggerHaptic('light');
              }}
              className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/15 hover:bg-white/25 text-white/90 border border-white/20 flex items-center gap-1.5 transition-colors"
              title="Toggle between Direct 4K/HD Stream and Cinema Player"
            >
              {playerMode === 'native' ? <Film className="w-3.5 h-3.5 text-purple-400" /> : <Tv className="w-3.5 h-3.5 text-blue-400" />}
              <span className="hidden sm:inline">
                {playerMode === 'native' ? 'Direct HD' : 'Cinema Mode'}
              </span>
            </button>

            {/* Video Sound Mute / Unmute Toggle */}
            <button
              onClick={toggleVideoAudio}
              className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md ${
                isAudioMuted 
                  ? 'bg-white/15 text-white/70 hover:bg-white/25 border border-white/20' 
                  : 'bg-emerald-500 text-black font-bold'
              }`}
              title={isAudioMuted ? 'Unmute Video Audio' : 'Mute Video Audio'}
            >
              {isAudioMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-black" />}
              <span className="hidden md:inline">
                {isAudioMuted ? 'Muted' : 'Sound On'}
              </span>
            </button>

            {/* Quality Selector (for native mode) */}
            {playerMode === 'native' && (
              <div className="relative">
                <button
                  onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-colors"
                  title="Video Quality Settings"
                >
                  <Settings className="w-4 h-4" />
                </button>

                {showSettingsMenu && (
                  <div className="absolute right-0 top-full mt-2 w-44 bg-[#141624] border border-white/15 rounded-2xl p-2 shadow-2xl backdrop-blur-2xl z-40 text-xs pointer-events-auto">
                    <div className="px-2 py-1 font-bold text-white/50 text-[10px] uppercase tracking-wider border-b border-white/10 mb-1">
                      Stream Quality
                    </div>
                    {(['1080p', '720p', '480p'] as const).map((q) => (
                      <button
                        key={q}
                        onClick={() => {
                          setQuality(q);
                          setShowSettingsMenu(false);
                          triggerHaptic('light');
                        }}
                        className={`w-full text-left px-2 py-1.5 rounded-lg flex items-center justify-between transition-colors ${
                          quality === q ? 'bg-white/20 text-white font-bold' : 'text-white/70 hover:bg-white/10'
                        }`}
                      >
                        <span>{q === '1080p' ? '1080p Full HD' : q === '720p' ? '720p HD' : '480p SD'}</span>
                        {quality === q && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Picture in Picture */}
            {playerMode === 'native' && (
              <button
                onClick={handleTogglePiP}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-colors"
                title="Picture-in-Picture"
              >
                <PictureInPicture className="w-4 h-4" />
              </button>
            )}

            {/* Fullscreen Video */}
            <button
              onClick={handleToggleFullscreen}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-colors"
              title="Fullscreen Video"
            >
              {isFullscreenVideo ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>

            {/* Optional Close Button */}
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white backdrop-blur-md transition-colors"
                title="Close Cinema Video"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Center Play/Pause Large Trigger (Only in native mode; embed has its own player) */}
        {playerMode === 'native' ? (
          <div className="flex items-center justify-center pointer-events-auto">
            <button
              onClick={() => {
                togglePlay();
                triggerHaptic('medium');
              }}
              className="w-16 h-16 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md flex items-center justify-center text-white shadow-2xl transition-all active:scale-90"
              title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
            >
              {isPlaying ? (
                <Pause className="w-8 h-8 fill-current" />
              ) : (
                <Play className="w-8 h-8 fill-current ml-1" />
              )}
            </button>
          </div>
        ) : (
          <div className="flex-1 pointer-events-none" />
        )}

        {/* Bottom Time Scrubber (Only in native mode; embed has its own scrubber) */}
        {playerMode === 'native' ? (
          <div className="space-y-1.5 pointer-events-auto">
            <div 
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const percent = Math.max(0, Math.min(1, clickX / rect.width));
                seek(percent * duration);
                triggerHaptic('selection');
              }}
              className="relative h-2 w-full bg-white/20 rounded-full cursor-pointer overflow-hidden group/bar transition-all hover:h-2.5"
            >
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`,
                  backgroundColor: primaryColor
                }}
              />
            </div>

            <div className="flex items-center justify-between text-xs font-mono text-white/70 px-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        ) : (
          <div className="pointer-events-none h-4" />
        )}
      </div>
    </div>
  );
};
