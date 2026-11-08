import React from 'react';
import { useAudio } from '../context/AudioContext';

export const AmbientBackground: React.FC = () => {
  const { currentTrack, isPlaying, activeThemeColor } = useAudio();

  // Dynamic colors derived from current track or active theme
  const dominant = activeThemeColor || currentTrack?.dominantColor || '#6366f1';
  const secondary = currentTrack?.secondaryColor || '#8b5cf6';

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
      {/* 1. Base Obsidian Depth Canvas (never solid flat black) */}
      <div 
        className="absolute inset-0 bg-[#07080e] transition-colors duration-1000"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, #0d0f1e 0%, #080913 50%, #050509 100%)'
        }}
      />

      {/* 2. Slow-Moving Evolving Mesh Gradients (Deep Indigo, Violet & Obsidian Nodes) */}
      {/* Node 1: Deep Indigo Top-Left Atmosphere (80-120px Gaussian Blur) */}
      <div
        className="absolute -top-[12%] -left-[10%] w-[68vw] h-[68vw] rounded-full blur-[110px] mix-blend-screen opacity-45 pointer-events-none animate-mesh-1 transition-all duration-1000"
        style={{
          background: `radial-gradient(circle, ${dominant}90 0%, #1e1347 50%, #0c0a21 100%)`,
          transformOrigin: 'center center'
        }}
      />

      {/* Node 2: Rich Violet Top-Right Atmosphere */}
      <div
        className="absolute top-[8%] -right-[15%] w-[64vw] h-[64vw] rounded-full blur-[120px] mix-blend-screen opacity-35 pointer-events-none animate-mesh-2 transition-all duration-1000"
        style={{
          background: `radial-gradient(circle, ${secondary}85 0%, #380c4a 50%, #18052b 100%)`,
          transformOrigin: 'center center'
        }}
      />

      {/* Node 3: Center-Bottom Evolving Liquid Core */}
      <div
        className="absolute -bottom-[18%] left-[15%] w-[60vw] h-[60vw] rounded-full blur-[100px] mix-blend-screen opacity-30 pointer-events-none animate-mesh-3 transition-all duration-1000"
        style={{
          background: `radial-gradient(circle, #2e1065 0%, #160f38 60%, #07080e 100%)`,
          transformOrigin: 'center center'
        }}
      />

      {/* Node 4: Dynamic Song Accent Node (breathing when playing) */}
      <div
        className={`absolute top-1/3 left-1/4 w-[45vw] h-[45vw] rounded-full blur-[90px] mix-blend-screen pointer-events-none transition-all duration-1000 ${
          isPlaying ? 'opacity-25 scale-105' : 'opacity-15 scale-95'
        }`}
        style={{
          background: `radial-gradient(circle, ${dominant} 0%, transparent 70%)`
        }}
      />

      {/* 3. Obsidian Depth Vignette (soft physical gradient to cradle UI sheets) */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 50%, transparent 20%, rgba(5, 5, 9, 0.45) 75%, rgba(5, 5, 9, 0.85) 100%)'
        }}
      />

      {/* 4. Micro Optical Sheen Mesh */}
      <div 
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.45) 1px, transparent 1px)',
          backgroundSize: '28px 28px'
        }}
      />
    </div>
  );
};
