import React, { useEffect, useState } from 'react';

/**
 * CANTICUM Veil from AETHER (GPL-3.0)
 * Cold-start veil with the cross of light, Roman numerals MMXXVI, and liquid ignition physics.
 */
export const CanticumVeil: React.FC<{ onDismiss?: () => void }> = ({ onDismiss }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    // Check if session veil has already played this session
    const played = sessionStorage.getItem('aura_veil_played');
    if (played) {
      setIsVisible(false);
      return;
    }

    const timer = setTimeout(() => {
      setIsFading(true);
      const dismissTimer = setTimeout(() => {
        setIsVisible(false);
        sessionStorage.setItem('aura_veil_played', 'true');
        onDismiss?.();
      }, 950);
      return () => clearTimeout(dismissTimer);
    }, 1800);

    return () => clearTimeout(timer);
  }, [onDismiss]);

  if (!isVisible) return null;

  return (
    <div 
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black transition-opacity duration-1000 pointer-events-none select-none ${
        isFading ? 'opacity-0' : 'opacity-100'
      }`}
      style={{
        background: '#000000'
      }}
    >
      <div className="flex flex-col items-center gap-6 animate-fade-in">
        {/* The Cross of Light */}
        <div className="relative w-32 h-32 flex items-center justify-center">
          {/* Vertical light beam */}
          <div className="absolute w-[1.5px] h-full bg-gradient-to-b from-transparent via-white to-transparent" />
          <div className="absolute w-[8px] h-full bg-gradient-to-b from-transparent via-white/20 to-transparent blur-[2px]" />
          
          {/* Horizontal light beam */}
          <div className="absolute h-[1.5px] w-20 bg-gradient-to-r from-transparent via-white to-transparent" />
          <div className="absolute h-[8px] w-20 bg-gradient-to-r from-transparent via-white/20 to-transparent blur-[2px]" />

          {/* Radial Halo */}
          <div className="w-20 h-20 rounded-full bg-[radial-gradient(closest-side,rgba(255,255,255,0.42),rgba(255,255,255,0.08)_40%,transparent)]" />
          
          {/* Intense Core */}
          <div className="absolute w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_16px_#fff]" />
        </div>

        {/* Wordmark and Roman Inscription */}
        <div className="text-center space-y-1.5">
          <h1 className="font-script text-5xl sm:text-6xl text-white tracking-wide">
            Aura
          </h1>
          <p className="font-serif-editorial text-xs tracking-[0.45em] text-[#9a9a9a] uppercase pl-[0.45em]">
            MMXXVI
          </p>
        </div>
      </div>
    </div>
  );
};
