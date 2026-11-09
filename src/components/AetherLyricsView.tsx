import React, { useRef, useEffect, useState } from 'react';
import { Sparkles, Activity, AlignLeft } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

interface LyricLine {
  time: number;
  text: string;
}

interface AetherLyricsViewProps {
  lyrics: LyricLine[];
  currentTime: number;
  onSeek: (time: number) => void;
  trackTitle?: string;
  trackArtist?: string;
}

/**
 * AETHER Dual-Mode Synced Lyrics
 * Adapted from AETHER by GHOSTxASR (GPL-3.0)
 * Choice between:
 *  1. Constellations Mode (words appear as glowing celestial stars in a night sky)
 *  2. Continuous Line Mode (single unbroken white poetic stroke on obsidian black)
 *  3. Classic Apple Music-style dynamic karaoke scroll
 */
export const AetherLyricsView: React.FC<AetherLyricsViewProps> = ({
  lyrics,
  currentTime,
  onSeek,
  trackTitle,
  trackArtist
}) => {
  const [lyricMode, setLyricMode] = useState<'constellations' | 'line' | 'karaoke'>('constellations');
  const activeLineRef = useRef<HTMLDivElement | null>(null);

  let activeIndex = -1;
  for (let i = lyrics.length - 1; i >= 0; i--) {
    if (currentTime >= lyrics[i].time) {
      activeIndex = i;
      break;
    }
  }

  useEffect(() => {
    if (activeLineRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [activeIndex]);

  const activeLyric = lyrics[activeIndex] || lyrics[0];

  return (
    <div className="w-full h-full flex flex-col justify-between select-none relative overflow-hidden">
      {/* Mode Segmented Controls */}
      <div className="flex items-center justify-between pt-2 pb-4 z-10 px-2">
        <div className="hidden sm:block text-left truncate max-w-[140px]">
          <span className="font-serif-editorial text-xs text-white/70 block truncate">{trackTitle}</span>
          <span className="text-[10px] text-white/40 block truncate">{trackArtist}</span>
        </div>
        <div className="p-1 rounded-full bg-white/[0.08] border border-white/10 backdrop-blur-xl flex items-center gap-1">
          <button
            onClick={() => { setLyricMode('constellations'); triggerHaptic('light'); }}
            className={`px-3 py-1 rounded-full font-caps text-[8.5px] tracking-[0.2em] flex items-center gap-1.5 transition-all ${
              lyricMode === 'constellations' ? 'bg-white text-black font-semibold shadow-md' : 'text-white/60 hover:text-white'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>CONSTELLATIONS</span>
          </button>
          <button
            onClick={() => { setLyricMode('line'); triggerHaptic('light'); }}
            className={`px-3 py-1 rounded-full font-caps text-[8.5px] tracking-[0.2em] flex items-center gap-1.5 transition-all ${
              lyricMode === 'line' ? 'bg-white text-black font-semibold shadow-md' : 'text-white/60 hover:text-white'
            }`}
          >
            <Activity className="w-3 h-3" />
            <span>CONTINUOUS LINE</span>
          </button>
          <button
            onClick={() => { setLyricMode('karaoke'); triggerHaptic('light'); }}
            className={`px-3 py-1 rounded-full font-caps text-[8.5px] tracking-[0.2em] flex items-center gap-1.5 transition-all ${
              lyricMode === 'karaoke' ? 'bg-white text-black font-semibold shadow-md' : 'text-white/60 hover:text-white'
            }`}
          >
            <AlignLeft className="w-3 h-3" />
            <span>KARAOKE</span>
          </button>
        </div>
      </div>

      {/* Mode 1: Constellations (Words as Stars in Night Sky) */}
      {lyricMode === 'constellations' && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center relative">
          {/* Ambient Starlight Dots */}
          <div className="absolute inset-0 pointer-events-none opacity-40">
            {Array.from({ length: 32 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 rounded-full bg-white animate-pulse"
                style={{
                  top: `${(i * 19) % 95}%`,
                  left: `${(i * 31) % 95}%`,
                  animationDuration: `${2 + (i % 3)}s`
                }}
              />
            ))}
          </div>

          <div className="relative z-10 max-w-lg space-y-4">
            <span className="font-caps text-[10px] tracking-[0.32em] text-[#ff3b30] block">
              LYRIC CONSTELLATION
            </span>
            <div className="font-serif-editorial italic text-3xl sm:text-5xl text-white font-normal leading-relaxed drop-shadow-[0_0_24px_rgba(255,255,255,0.7)]">
              {activeLyric?.text || 'Listening to the melody...'}
            </div>
            {lyrics[activeIndex + 1] && (
              <p className="font-sans text-xs text-white/40 tracking-wider">
                {lyrics[activeIndex + 1].text}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Mode 2: Continuous Line Mode */}
      {lyricMode === 'line' && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center relative">
          {/* Flowing Horizontal Line Artwork */}
          <div className="w-full max-w-md h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent mb-8" />
          <div className="font-serif-editorial text-2xl sm:text-4xl text-white font-light tracking-wide max-w-md leading-relaxed">
            {activeLyric?.text ? `"${activeLyric.text}"` : 'Instrumental phrase'}
          </div>
          <div className="w-full max-w-md h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent mt-8" />
          <span className="font-caps text-[9px] tracking-[0.26em] text-white/40 mt-4 block">
            UNBROKEN POETIC LINE
          </span>
        </div>
      )}

      {/* Mode 3: Classic Dynamic Karaoke Scroll */}
      {lyricMode === 'karaoke' && (
        <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6 no-scrollbar text-left max-w-xl mx-auto">
          {lyrics.length === 0 ? (
            <div className="h-full flex items-center justify-center text-white/50 font-serif-editorial italic text-lg">
              No synchronized lyrics available for this track.
            </div>
          ) : (
            lyrics.map((line, idx) => {
              const isActive = idx === activeIndex;
              const isPast = idx < activeIndex;

              return (
                <div
                  key={idx}
                  ref={isActive ? activeLineRef : null}
                  onClick={() => onSeek(line.time)}
                  className={`cursor-pointer transition-all duration-300 py-1 ${
                    isActive
                      ? 'text-white text-2xl sm:text-3xl font-serif-editorial font-medium drop-shadow-md scale-[1.02] origin-left'
                      : isPast
                      ? 'text-white/30 text-lg sm:text-xl font-serif-editorial'
                      : 'text-white/50 text-lg sm:text-xl font-serif-editorial hover:text-white/80'
                  }`}
                >
                  {line.text}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
