import React, { useEffect, useRef, useState } from 'react';
import { useAudio } from '../context/AudioContext';
import { 
  X, 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Music, 
  Share2, 
  CloudDownload, 
  Loader2, 
  Sparkles,
  Check,
  Mic2
} from 'lucide-react';
import { formatTime } from '../utils/formatTime';
import { LyricQuoteCardModal } from './LyricQuoteCardModal';

export const SyncedLyricsModal: React.FC = () => {
  const { 
    currentTrack, 
    currentTime, 
    duration, 
    isPlaying, 
    togglePlay, 
    skipNext, 
    skipPrev, 
    seek, 
    isLyricsOpen, 
    setIsLyricsOpen,
    settings,
    fetchLyricsFromLrclib,
    vocalReductionLevel,
    setVocalReductionLevel
  } = useAudio();

  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [selectedQuoteText, setSelectedQuoteText] = useState('');
  const [isFetchingLrc, setIsFetchingLrc] = useState(false);
  const [fetchNotification, setFetchNotification] = useState<string | null>(null);

  const activeLineRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const lyrics = currentTrack?.lyrics || [];

  // Find the index of the currently playing lyric
  let activeIndex = -1;
  for (let i = lyrics.length - 1; i >= 0; i--) {
    if (currentTime >= lyrics[i].time) {
      activeIndex = i;
      break;
    }
  }

  // Auto fetch synced lyrics if opened and lyrics are missing or incomplete
  useEffect(() => {
    if (isLyricsOpen && currentTrack && (!currentTrack.lyrics || currentTrack.lyrics.length < 15) && !isFetchingLrc) {
      setIsFetchingLrc(true);
      fetchLyricsFromLrclib(currentTrack).finally(() => {
        setIsFetchingLrc(false);
      });
    }
  }, [isLyricsOpen, currentTrack, fetchLyricsFromLrclib]);

  // Smooth auto-scroll to keep active line centered
  useEffect(() => {
    if (isLyricsOpen && activeLineRef.current && containerRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [activeIndex, isLyricsOpen]);

  const handleOpenQuoteCard = (text?: string) => {
    const quote = text || (lyrics[activeIndex]?.text || currentTrack?.title || '');
    setSelectedQuoteText(quote);
    setQuoteModalOpen(true);
  };

  const handleFetchFromLrclib = async () => {
    if (!currentTrack || isFetchingLrc) return;
    setIsFetchingLrc(true);
    setFetchNotification(null);
    try {
      const success = await fetchLyricsFromLrclib(currentTrack);
      if (success) {
        setFetchNotification('Synced lyrics matched from LRCLIB!');
      } else {
        setFetchNotification('No matching lyrics found on LRCLIB.');
      }
    } catch {
      setFetchNotification('Network error connecting to LRCLIB.');
    } finally {
      setIsFetchingLrc(false);
      setTimeout(() => setFetchNotification(null), 4000);
    }
  };

  if (!isLyricsOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 md:p-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Dynamic Blurred Backdrop using Cover Art */}
        <div 
          className="absolute inset-0 bg-black/75 backdrop-blur-3xl"
          onClick={() => setIsLyricsOpen(false)}
        />

        {/* Ambient glowing color splash in modal */}
        <div 
          className="absolute w-[600px] h-[600px] rounded-full blur-[160px] opacity-35 pointer-events-none transition-all duration-700"
          style={{ backgroundColor: currentTrack?.dominantColor || '#fa2d48' }}
        />

        {/* Main Container */}
        <div className="relative z-10 w-full max-w-4xl h-[88vh] flex flex-col md:flex-row glass-sheet rounded-[28px] overflow-hidden shadow-[0_25px_70px_rgba(0,0,0,0.85)]">
          
          {/* Left Side: Large Album Cover & Track Details (Desktop) */}
          <div className="hidden md:flex md:w-5/12 p-8 flex-col justify-between border-r border-white/10 bg-white/[0.015]">
            {/* Header */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold tracking-widest uppercase text-white/40 flex items-center gap-2">
                <Music className="w-4 h-4 text-[#fa2d48]" /> Time-Synced Lyrics
              </span>

              <button
                onClick={() => handleOpenQuoteCard()}
                className="text-xs px-2.5 py-1 rounded-full glass-pill text-white/65 hover:text-white spring-button flex items-center gap-1.5"
                title="Create Aesthetic Quote Card for Instagram/Status"
              >
                <Share2 className="w-3 h-3 text-[#fa2d48]" />
                <span>Quote Card</span>
              </button>
            </div>

            {/* Center Art with Duplicate Blurred Outer Shadow */}
            <div className="my-auto text-center flex flex-col items-center">
              <div className="relative w-64 h-64 shrink-0 group">
                <img
                  src={currentTrack?.coverUrl}
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 w-full h-full object-cover rounded-2xl blur-xl scale-95 opacity-70 group-hover:scale-105 group-hover:opacity-90 transition-all duration-500 -z-10 pointer-events-none"
                />
                <div className="relative w-64 h-64 rounded-2xl overflow-hidden shadow-[0_12px_32px_rgba(0,0,0,0.4)] ring-1 ring-white/10 transition-transform duration-500 group-hover:scale-105">
                  <img
                    src={currentTrack?.coverUrl}
                    alt={currentTrack?.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <span className="text-xs text-white/90 font-medium">{currentTrack?.genre}</span>
                  </div>
                </div>
              </div>

              <h2 className="mt-6 text-2xl font-bold text-white tracking-tight line-clamp-1">
                {currentTrack?.title}
              </h2>
              <p className="mt-1 text-sm font-medium text-white/65 line-clamp-1">
                {currentTrack?.artist}
              </p>
              <p className="text-xs text-white/40 tabular-nums mt-0.5">
                {currentTrack?.album} • {currentTrack?.year || '2026'}
              </p>

              {/* Online LRCLIB Fetch Button */}
              <button
                onClick={handleFetchFromLrclib}
                disabled={isFetchingLrc}
                className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-pill text-xs font-medium text-white/65 hover:text-white spring-button disabled:opacity-50"
                title="Fetch synced LRC lyrics from LRCLIB open-source database"
              >
                {isFetchingLrc ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#fa2d48]" />
                ) : (
                  <CloudDownload className="w-3.5 h-3.5 text-[#fa2d48]" />
                )}
                <span>Fetch from LRCLIB</span>
              </button>

              {fetchNotification && (
                <div className="mt-2 text-xs px-2.5 py-1 rounded-lg bg-white/10 text-white/90 flex items-center gap-1 animate-in fade-in">
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span>{fetchNotification}</span>
                </div>
              )}
            </div>

            {/* Mini Playback Controls in Modal */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs text-white/40 font-mono tabular-nums">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
              
              <div className="flex items-center justify-center gap-6">
                <button
                  onClick={skipPrev}
                  className="text-white/70 hover:text-white transition-colors p-2"
                  title="Previous"
                >
                  <SkipBack className="w-5 h-5 fill-current" />
                </button>

                <button
                  onClick={togglePlay}
                  className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg"
                  title={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? (
                    <Pause className="w-6 h-6 fill-current" />
                  ) : (
                    <Play className="w-6 h-6 fill-current translate-x-0.5" />
                  )}
                </button>

                <button
                  onClick={skipNext}
                  className="text-white/70 hover:text-white transition-colors p-2"
                  title="Next"
                >
                  <SkipForward className="w-5 h-5 fill-current" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Side: Scrollable Synced Lyrics */}
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            {/* Top Bar */}
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-white/10 bg-white/[0.02]">
              <div className="md:hidden flex items-center gap-3 min-w-0">
                <img
                  src={currentTrack?.coverUrl}
                  alt={currentTrack?.title}
                  className="w-10 h-10 rounded-lg object-cover shrink-0"
                />
                <div className="truncate">
                  <h4 className="text-sm font-semibold text-white truncate">{currentTrack?.title}</h4>
                  <p className="text-xs text-white/60 truncate">{currentTrack?.artist}</p>
                </div>
              </div>

              <div className="hidden md:flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#fa2d48]" />
                <span className="text-xs font-medium text-white/50">
                  Click any line to jump directly • Hover to share quote card
                </span>
              </div>

              <div className="flex items-center gap-2 ml-auto">
                {/* Apple Music Sing (Karaoke Vocal Attenuator) */}
                <div 
                  className={`flex items-center gap-2 px-2.5 sm:px-3 py-1 rounded-full border transition-all ${
                    vocalReductionLevel > 0 
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300' 
                      : 'bg-white/5 border-white/10 text-white/70'
                  }`}
                  title="Apple Music Sing - Attenuate vocals in real time to sing along"
                >
                  <Mic2 className={`w-3.5 h-3.5 ${vocalReductionLevel > 0 ? 'text-emerald-400 animate-pulse' : 'text-white/50'}`} />
                  <span className="text-[11px] font-bold hidden sm:inline">Sing:</span>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={vocalReductionLevel}
                    onChange={(e) => setVocalReductionLevel(Number(e.target.value))}
                    className="w-14 sm:w-20 h-1 accent-emerald-400 cursor-pointer"
                  />
                  <span className="text-[10px] font-mono font-bold min-w-[28px] text-right">
                    {Math.round(vocalReductionLevel * 100)}%
                  </span>
                </div>

                {/* Mobile quote card trigger */}
                <button
                  onClick={() => handleOpenQuoteCard()}
                  className="md:hidden p-2 rounded-xl text-white/70 hover:text-white bg-white/10"
                  title="Share Quote Card"
                >
                  <Share2 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setIsLyricsOpen(false)}
                  className="p-2 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                  title="Close Lyrics"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Lyrics Scroll Container */}
            <div 
              ref={containerRef}
              className="flex-1 overflow-y-auto px-6 md:px-12 py-16 space-y-8 scroll-smooth select-none"
            >
              {lyrics.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-white/40 space-y-4 px-4">
                  <Music className="w-12 h-12 text-white/20 stroke-1" />
                  <p className="text-lg font-medium text-white/80">No synced lyrics available yet for this track.</p>
                  <p className="text-xs text-white/40 max-w-sm">
                    Fetch synced timestamped lyrics directly from the community LRCLIB database.
                  </p>
                  
                  <button
                    onClick={handleFetchFromLrclib}
                    disabled={isFetchingLrc}
                    className="px-5 py-2.5 rounded-2xl bg-[#fa2d48] hover:bg-[#fa2d48]/90 text-white font-semibold text-xs flex items-center gap-2 shadow-lg transition-transform active:scale-95 disabled:opacity-50"
                  >
                    {isFetchingLrc ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CloudDownload className="w-4 h-4" />
                    )}
                    <span>Search & Fetch from LRCLIB</span>
                  </button>

                  {fetchNotification && (
                    <p className="text-xs text-emerald-400">{fetchNotification}</p>
                  )}
                </div>
              ) : (
                lyrics.map((line, idx) => {
                  const isActive = idx === activeIndex;
                  const isPassed = idx < activeIndex;

                  const sizeClasses = 
                    settings.lyricsFontSize === 'huge'
                      ? (isActive ? 'text-3xl md:text-5xl font-black' : 'text-xl md:text-3xl font-bold')
                      : settings.lyricsFontSize === 'normal'
                      ? (isActive ? 'text-xl md:text-2xl font-bold' : 'text-base md:text-lg font-medium')
                      : (isActive ? 'text-2xl md:text-3xl font-extrabold' : 'text-xl md:text-2xl font-semibold');

                  return (
                    <div
                      key={idx}
                      ref={isActive ? activeLineRef : null}
                      className={`relative group/line flex items-center justify-between cursor-pointer transition-all duration-300 transform origin-left py-1.5 ${sizeClasses} ${
                        isActive
                          ? 'text-white scale-[1.02] drop-shadow-[0_4px_16px_rgba(255,255,255,0.3)]'
                          : isPassed
                          ? 'text-white/40 hover:text-white/80'
                          : 'text-white/25 hover:text-white/70'
                      }`}
                    >
                      <div 
                        onClick={() => seek(line.time)}
                        className="flex-1 pr-4"
                      >
                        <span className="inline-block relative">
                          {line.text}
                          {isActive && (
                            <span 
                              className="absolute -left-5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full animate-ping"
                              style={{ backgroundColor: currentTrack?.dominantColor || '#fa2d48' }}
                            />
                          )}
                        </span>
                      </div>

                      {/* Hover Quote Card Trigger */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenQuoteCard(line.text);
                        }}
                        className="opacity-0 group-hover/line:opacity-100 transition-opacity p-2 rounded-xl bg-white/10 hover:bg-[#fa2d48] text-white shrink-0"
                        title="Create Quote Card for this line"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })
              )}
              {/* Bottom spacer for centering */}
              <div className="h-32" />
            </div>
          </div>

        </div>
      </div>

      {/* Social Lyric Quote Card Modal */}
      <LyricQuoteCardModal
        isOpen={quoteModalOpen}
        onClose={() => setQuoteModalOpen(false)}
        selectedLyricText={selectedQuoteText}
      />
    </>
  );
};
