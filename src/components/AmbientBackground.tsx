import React from 'react';
import { useAudio } from '../context/AudioContext';

export const AmbientBackground: React.FC = () => {
  const { currentTrack, isPlaying, activeThemeColor } = useAudio();

  // Dynamic colors derived from current track or active theme
  const dominant = activeThemeColor || currentTrack?.dominantColor || '#fa2d48';
  const secondary = currentTrack?.secondaryColor || '#8b5cf6';

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
      {/* 1. Base Obsidian Depth Canvas (never solid flat black) */}
      <div 
        className="absolute inset-0 bg-[#07080e] transition-colors duration-1000"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, #0e1022 0%, #080914 45%, #050509 100%)'
        }}
      />

      {/* 2. Apple Music Multi-Point Liquid Mesh Gradient Morpher (60fps continuous hardware-accelerated drift) */}
      
      {/* Node 1: Dominant Hue Atmosphere (Top-Left Liquid Bubble) */}
      <div
        className="absolute -top-[16%] -left-[12%] w-[72vw] h-[72vw] rounded-full blur-[120px] mix-blend-screen opacity-50 pointer-events-none animate-mesh-1 transition-all duration-1000"
        style={{
          background: `radial-gradient(circle, ${dominant}cc 0%, #1e1347 50%, #0c0a21 100%)`,
          transformOrigin: 'center center'
        }}
      />

      {/* Node 2: Secondary Harmonic Node (Top-Right Atmospheric Cloud) */}
      <div
        className="absolute -top-[5%] -right-[18%] w-[68vw] h-[68vw] rounded-full blur-[130px] mix-blend-screen opacity-40 pointer-events-none animate-mesh-2 transition-all duration-1000"
        style={{
          background: `radial-gradient(circle, ${secondary}bb 0%, #380c4a 50%, #18052b 100%)`,
          transformOrigin: 'center center'
        }}
      />

      {/* Node 3: Deep Indigo / Violet Liquid Core (Bottom-Left) */}
      <div
        className="absolute -bottom-[20%] -left-[10%] w-[65vw] h-[65vw] rounded-full blur-[110px] mix-blend-screen opacity-35 pointer-events-none animate-mesh-3 transition-all duration-1000"
        style={{
          background: `radial-gradient(circle, #3b0764 0%, #170d38 60%, #07080e 100%)`,
          transformOrigin: 'center center'
        }}
      />

      {/* Node 4: Dynamic Song Accent Node (Center Liquid Orb - expands & pulses with playback) */}
      <div
        className={`absolute top-[28%] left-[22%] w-[52vw] h-[52vw] rounded-full blur-[95px] mix-blend-screen pointer-events-none animate-mesh-4 transition-all duration-1000 ${
          isPlaying ? 'opacity-35 scale-110' : 'opacity-20 scale-95'
        }`}
        style={{
          background: `radial-gradient(circle, ${dominant}ee 0%, ${secondary}66 45%, transparent 75%)`,
          transformOrigin: 'center center'
        }}
      />

      {/* Node 5: Atmospheric Bottom-Right Warmth Drift */}
      <div
        className="absolute -bottom-[15%] -right-[12%] w-[58vw] h-[58vw] rounded-full blur-[115px] mix-blend-screen opacity-30 pointer-events-none animate-mesh-5 transition-all duration-1000"
        style={{
          background: `radial-gradient(circle, ${dominant}88 0%, #1e1b4b 55%, transparent 80%)`,
          transformOrigin: 'center center'
        }}
      />

      {/* 3. Obsidian Depth Vignette (smoothly cradles UI sheets and prevents flat banding) */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 50%, transparent 25%, rgba(5, 5, 9, 0.40) 70%, rgba(5, 5, 9, 0.88) 100%)'
        }}
      />

      {/* 4. Optical Film Sheen Grid (eliminates 8-bit color banding on OLED screens) */}
      <div 
        className="absolute inset-0 opacity-[0.028] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.45) 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      />
    </div>
  );
};
