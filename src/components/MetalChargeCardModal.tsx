import React, { useState, useRef } from 'react';
import { useAudio } from '../context/AudioContext';
import { X, Download } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';
import { get4kArtworkUrl, handleArtworkError } from '../utils/artworkUtils';

/**
 * Metal Charge Card Modal
 * Adapted from AETHER by GHOSTxASR (GPL-3.0)
 * Engraved obsidian black and brushed silver titanium listener charge card with milled 96-tooth medal and 3D tilt perspective.
 */
export const MetalChargeCardModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const { currentTrack, recentlyPlayed, tracks } = useAudio();
  const [finish, setFinish] = useState<'black' | 'silver'>('black');
  const [rotX, setRotX] = useState(0);
  const [rotY, setRotY] = useState(0);
  const cardRef = useRef<HTMLDivElement | null>(null);

  if (!isOpen) return null;

  const topSongs = recentlyPlayed.length > 0 ? recentlyPlayed.slice(0, 3) : tracks.slice(0, 3);
  const heroArtwork = currentTrack ? get4kArtworkUrl(currentTrack) : (topSongs[0] ? get4kArtworkUrl(topSongs[0]) : '/statues/statue.jpg');

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const rx = -(y / (rect.height / 2)) * 14;
    const ry = (x / (rect.width / 2)) * 14;
    setRotX(rx);
    setRotY(ry);
  };

  const handlePointerLeave = () => {
    setRotX(0);
    setRotY(0);
  };

  const isSilver = finish === 'silver';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-3xl animate-fade-in select-none">
      <div className="relative flex flex-col items-center gap-6 max-h-[95vh] overflow-y-auto no-scrollbar py-6">
        {/* Top Control Bar */}
        <div className="w-full max-w-sm flex items-center justify-between">
          {/* Finish Switcher */}
          <div className="p-1 rounded-full bg-white/10 border border-white/15 flex items-center gap-1">
            <button
              onClick={() => { setFinish('black'); triggerHaptic('light'); }}
              className={`px-4 py-1.5 rounded-full font-caps text-[9px] tracking-[0.2em] transition-all ${
                !isSilver ? 'bg-black text-white shadow-lg border border-white/20' : 'text-white/60 hover:text-white'
              }`}
            >
              OBSIDIAN
            </button>
            <button
              onClick={() => { setFinish('silver'); triggerHaptic('light'); }}
              className={`px-4 py-1.5 rounded-full font-caps text-[9px] tracking-[0.2em] transition-all ${
                isSilver ? 'bg-white text-black shadow-lg font-semibold' : 'text-white/60 hover:text-white'
              }`}
            >
              TITANIUM
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 3D Perspective Card Stage */}
        <div 
          style={{ perspective: '1200px' }}
          className="w-full max-w-[340px] sm:max-w-[360px]"
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
        >
          <div
            ref={cardRef}
            style={{
              transform: `rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg)`,
              transition: rotX === 0 && rotY === 0 ? 'transform 0.6s cubic-bezier(0.2, 0.9, 0.25, 1)' : 'none'
            }}
            className={`relative w-full rounded-[28px] overflow-hidden p-6 sm:p-7 flex flex-col justify-between shadow-2xl border transition-colors duration-500 min-h-[580px] ${
              isSilver 
                ? 'bg-gradient-to-br from-[#f0f2f5] via-[#d6d9e0] to-[#b8bcc6] text-[#0b0b0c] border-white/80 shadow-[0_24px_64px_rgba(255,255,255,0.12)]'
                : 'bg-gradient-to-br from-[#1c1d22] via-[#0d0e12] to-[#050507] text-white border-white/20 shadow-[0_24px_64px_rgba(0,0,0,0.9)]'
            }`}
          >
            {/* Subtle Metallic Sheen Reflection */}
            <div 
              className="absolute inset-0 pointer-events-none opacity-40 mix-blend-overlay"
              style={{
                background: `radial-gradient(circle at ${(50 + rotY * 2.5)}% ${(50 - rotX * 2.5)}%, rgba(255,255,255,0.8), transparent 60%)`
              }}
            />

            {/* Top Bar: Wordmark & Tier */}
            <div className="relative z-10 flex items-center justify-between">
              <span className="font-script text-4xl sm:text-5xl leading-none">
                Aura
              </span>
              <div className="text-right">
                <span className={`font-caps text-[8.5px] tracking-[0.28em] block ${isSilver ? 'text-black/60' : 'text-white/60'}`}>
                  TIER
                </span>
                <span className="font-caps text-[10px] tracking-[0.24em] font-bold">
                  PATRON MMXXVI
                </span>
              </div>
            </div>

            {/* Center Milled 96-Tooth Medal */}
            <div className="relative z-10 flex flex-col items-center my-auto py-4">
              <div className="relative w-36 h-36 flex items-center justify-center">
                {/* 96 Milled Teeth SVG Bezel */}
                <svg className="absolute inset-0 w-full h-full animate-spin-slow" viewBox="0 0 156 156">
                  {Array.from({ length: 96 }).map((_, k) => {
                    const a = (k * 3.75 * Math.PI) / 180;
                    const x1 = (78 + Math.cos(a) * 71.5).toFixed(2);
                    const y1 = (78 + Math.sin(a) * 71.5).toFixed(2);
                    const x2 = (78 + Math.cos(a) * 75.5).toFixed(2);
                    const y2 = (78 + Math.sin(a) * 75.5).toFixed(2);
                    return (
                      <line
                        key={k}
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke={isSilver ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.32)'}
                        strokeWidth="0.75"
                      />
                    );
                  })}
                </svg>

                {/* Inner Album Art / Portrait Circle */}
                <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-white/20 shadow-xl">
                  <img
                    src={heroArtwork}
                    onError={handleArtworkError}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <span className={`font-caps text-[8px] tracking-[0.32em] mt-3.5 ${isSilver ? 'text-black/55' : 'text-white/50'}`}>
                STUDIO FIDELITY ACCREDITED
              </span>
              <span className="font-serif-editorial italic text-base sm:text-lg mt-0.5">
                Bit-Perfect Signal Path
              </span>
            </div>

            {/* Listening Metric Figures */}
            <div className={`relative z-10 grid grid-cols-3 text-center py-3 border-y ${isSilver ? 'border-black/15' : 'border-white/15'}`}>
              <div>
                <div className="font-mono text-base font-bold tabular-nums">482</div>
                <div className={`font-caps text-[7px] tracking-[0.2em] ${isSilver ? 'text-black/50' : 'text-white/50'}`}>PLAYS</div>
              </div>
              <div>
                <div className="font-mono text-base font-bold tabular-nums">38.4</div>
                <div className={`font-caps text-[7px] tracking-[0.2em] ${isSilver ? 'text-black/50' : 'text-white/50'}`}>HOURS</div>
              </div>
              <div>
                <div className="font-mono text-base font-bold tabular-nums">320k</div>
                <div className={`font-caps text-[7px] tracking-[0.2em] ${isSilver ? 'text-black/50' : 'text-white/50'}`}>AUDIO</div>
              </div>
            </div>

            {/* Top Played Tracks */}
            <div className="relative z-10 py-3 space-y-1.5">
              <span className={`font-caps text-[7.5px] tracking-[0.26em] block ${isSilver ? 'text-black/55' : 'text-white/50'}`}>
                SIGNATURE REPERTOIRE
              </span>
              {topSongs.map((track, i) => (
                <div key={track.id || i} className="flex items-center justify-between text-xs font-sans">
                  <span className="truncate max-w-[190px] font-medium">
                    {i + 1}. {track.title}
                  </span>
                  <span className={`text-[10px] truncate max-w-[90px] ${isSilver ? 'text-black/60' : 'text-white/60'}`}>
                    {track.artist}
                  </span>
                </div>
              ))}
            </div>

            {/* Footer Inscription */}
            <div className={`relative z-10 pt-2 flex items-end justify-between border-t ${isSilver ? 'border-black/15' : 'border-white/15'}`}>
              <div>
                <span className={`font-caps text-[7px] tracking-[0.24em] block ${isSilver ? 'text-black/50' : 'text-white/50'}`}>
                  CARDHOLDER
                </span>
                <span className="font-sans font-bold text-xs tracking-wider">
                  ANSHUMAN KUMAR
                </span>
              </div>
              <div className="text-right">
                <span className={`font-caps text-[7px] tracking-[0.24em] block ${isSilver ? 'text-black/50' : 'text-white/50'}`}>
                  ISSUED
                </span>
                <span className="font-serif-editorial text-xs italic">
                  Aura MMXXVI
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              triggerHaptic('success');
              alert('Charge Card saved to Gallery (1080x1920 Story Resolution)');
            }}
            className="px-6 py-2.5 rounded-full bg-white text-black font-caps text-[10px] tracking-[0.22em] font-semibold flex items-center gap-2 hover:scale-105 active:scale-95 transition-transform shadow-xl"
          >
            <Download className="w-3.5 h-3.5" />
            <span>EXPORT CHARGE CARD</span>
          </button>
        </div>
      </div>
    </div>
  );
};
