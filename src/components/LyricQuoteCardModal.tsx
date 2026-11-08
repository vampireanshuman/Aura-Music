import React, { useRef } from 'react';
import { useAudio } from '../context/AudioContext';
import { X, Share2, Copy, Check, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface LyricQuoteCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLyricText: string;
}

export const LyricQuoteCardModal: React.FC<LyricQuoteCardModalProps> = ({
  isOpen,
  onClose,
  selectedLyricText,
}) => {
  const { currentTrack } = useAudio();
  const [copied, setCopied] = React.useState(false);
  const cardRef = useRef<HTMLDivElement | null>(null);

  if (!isOpen || !currentTrack) return null;

  const quoteText = selectedLyricText || (currentTrack.lyrics[1]?.text ?? currentTrack.title);

  const handleCopyQuote = () => {
    const formatted = `"${quoteText}" — ${currentTrack.title} by ${currentTrack.artist} 🎵`;
    navigator.clipboard.writeText(formatted);
    setCopied(true);
    try {
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.8 } });
    } catch {
      // ignore
    }
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200">
      <div 
        className="absolute inset-0 bg-black/75 backdrop-blur-md"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-md bg-[#12141f] border border-white/10 rounded-3xl p-6 shadow-2xl backdrop-blur-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-[#fa2d48]" />
            <h3 className="text-base font-bold text-white tracking-tight">Lyrics Quote Card</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Aesthetic Instagram/Story Preview Card */}
        <div 
          ref={cardRef}
          className="my-5 p-6 rounded-3xl relative overflow-hidden border border-white/20 shadow-2xl text-left flex flex-col justify-between min-h-[320px]"
          style={{
            background: `linear-gradient(135deg, ${currentTrack.dominantColor}CC 0%, #0b0d17 100%)`
          }}
        >
          {/* Ambient overlay sheen */}
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full blur-3xl bg-white/20 pointer-events-none" />

          {/* Top Branding */}
          <div className="flex items-center justify-between text-white/70 text-xs font-semibold tracking-wider uppercase">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Aura Music Lyrics
            </span>
            <span>{currentTrack.genre}</span>
          </div>

          {/* Center Big Quote */}
          <div className="my-auto py-6">
            <p className="text-2xl sm:text-3xl font-extrabold text-white leading-tight tracking-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)]">
              "{quoteText}"
            </p>
          </div>

          {/* Bottom Track Attribution */}
          <div className="flex items-center gap-3 pt-4 border-t border-white/20">
            <img
              src={currentTrack.coverUrl}
              alt={currentTrack.title}
              className="w-12 h-12 rounded-xl object-cover shadow-lg ring-1 ring-white/30"
            />
            <div className="min-w-0">
              <h4 className="text-sm font-bold text-white truncate">
                {currentTrack.title}
              </h4>
              <p className="text-xs text-white/80 font-medium truncate">
                {currentTrack.artist} • {currentTrack.album}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={handleCopyQuote}
            className="w-full py-3 rounded-2xl bg-[#fa2d48] hover:bg-[#fa2d48]/90 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" /> Copied to Clipboard!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" /> Copy Quote Card
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
