import React from 'react';
import { useAudio } from '../context/AudioContext';
import { X, Sparkles, Check, Radio, Flame, Waves } from 'lucide-react';
import { SOUND_QUALITY_SPECS, type SoundQualityMode } from '../utils/audioDSP';
import type { SpatialRoom } from '../types/music';

export const AudioQualityModal: React.FC = () => {
  const { 
    isAudioQualityModalOpen, 
    setIsAudioQualityModalOpen, 
    soundQualityMode, 
    setSoundQualityMode,
    currentTrack,
    tubeWarmth,
    setTubeWarmth,
    spatialRoom,
    setSpatialRoom
  } = useAudio();

  if (!isAudioQualityModalOpen) return null;

  const currentSpecs = SOUND_QUALITY_SPECS[soundQualityMode];

  const modes: SoundQualityMode[] = ['dolby-atmos', 'hi-res-lossless', 'cd-lossless', 'high-quality'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={() => setIsAudioQualityModalOpen(false)}
      />

      {/* Modal Card */}
      <div className="relative z-10 w-full max-w-lg bg-[#11131e]/95 border border-white/10 rounded-3xl p-6 shadow-2xl backdrop-blur-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-5 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div 
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-lg"
              style={{ backgroundColor: currentTrack?.dominantColor || '#fa2d48' }}
            >
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">Audio Stream Quality</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/80 font-mono font-bold">
                  MASTER
                </span>
              </div>
              <p className="text-xs text-white/50 mt-0.5">Apple Music & Dolby Atmos Acoustic Engine</p>
            </div>
          </div>

          <button
            onClick={() => setIsAudioQualityModalOpen(false)}
            className="p-1.5 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Stream Active Specs Box */}
        <div className="my-5 p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-white/50 font-semibold">
              Live Stream Specs
            </span>
            <span className="text-xs font-bold text-[#fa2d48] px-2 py-0.5 rounded-md bg-[#fa2d48]/10 border border-[#fa2d48]/20">
              {currentSpecs.badge}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-2.5 rounded-xl bg-white/[0.03]">
              <span className="text-white/40 block text-[10px]">BIT DEPTH</span>
              <span className="text-white font-semibold">{currentSpecs.bitDepth}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white/[0.03]">
              <span className="text-white/40 block text-[10px]">SAMPLE RATE</span>
              <span className="text-white font-semibold">{currentSpecs.sampleRate}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white/[0.03]">
              <span className="text-white/40 block text-[10px]">CODEC / CONTAINER</span>
              <span className="text-white font-semibold">{currentSpecs.codec}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white/[0.03]">
              <span className="text-white/40 block text-[10px]">CHANNELS</span>
              <span className="text-white font-semibold">{currentSpecs.channels}</span>
            </div>
          </div>

          <p className="text-xs text-white/60 leading-relaxed pt-1">
            {currentSpecs.description}
          </p>
        </div>

        {/* Mode Selector */}
        <div className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-white/50 block">
            Select Audio Processing Mode
          </span>

          <div className="grid grid-cols-1 gap-2">
            {modes.map((mode) => {
              const spec = SOUND_QUALITY_SPECS[mode];
              const isSelected = soundQualityMode === mode;

              return (
                <div
                  key={mode}
                  onClick={() => setSoundQualityMode(mode)}
                  className={`cursor-pointer p-3 rounded-2xl border transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-white/10 border-white/30 shadow-md'
                      : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05]'
                  }`}
                >
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      {spec.name}
                      {mode === 'dolby-atmos' && (
                        <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.2 rounded-full bg-purple-500/20 text-purple-300 font-bold">
                          Spatial 3D
                        </span>
                      )}
                      {mode === 'hi-res-lossless' && (
                        <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 font-bold">
                          24-Bit Studio
                        </span>
                      )}
                    </h4>
                    <p className="text-xs text-white/50 mt-0.5">{spec.badge}</p>
                  </div>

                  <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                    isSelected 
                      ? 'bg-[#fa2d48] border-[#fa2d48] text-white' 
                      : 'border-white/20 text-transparent'
                  }`}>
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Tube Warmth & Spatial Room Tuners */}
        <div className="mt-5 pt-4 border-t border-white/10 space-y-3.5">
          {/* Tube Warmth */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-white/70 font-semibold flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>Vacuum Tube Saturation:</span>
              </span>
              <span className="font-mono font-bold text-amber-400">
                {tubeWarmth > 0 ? `+${tubeWarmth.toFixed(1)} dB Warmth` : 'Pure Digital (0 dB)'}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={10}
              step={0.5}
              value={tubeWarmth}
              onChange={(e) => setTubeWarmth(Number(e.target.value))}
              className="w-full h-1.5 accent-amber-400 cursor-pointer"
            />
          </div>

          {/* Virtual Acoustic Room */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-white/70 font-semibold flex items-center gap-1.5">
                <Waves className="w-3.5 h-3.5 text-indigo-400" />
                <span>Virtual Acoustic Room:</span>
              </span>
              <span className="font-mono font-bold text-indigo-300 uppercase text-[11px]">
                {spatialRoom}
              </span>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {(['off', 'studio', 'concert', 'cathedral', 'lounge'] as SpatialRoom[]).map((room) => (
                <button
                  key={room}
                  onClick={() => setSpatialRoom(room)}
                  className={`py-1.5 px-1 rounded-xl text-[10px] font-bold uppercase tracking-wider border transition-all ${
                    spatialRoom === room
                      ? 'bg-indigo-500/20 border-indigo-400 text-white shadow-sm'
                      : 'bg-white/[0.02] border-white/5 text-white/50 hover:text-white'
                  }`}
                >
                  {room === 'concert' ? 'Arena' : room === 'lounge' ? 'Jazz' : room}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-white/40">
          <span className="flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-[#fa2d48]" /> Real-time Web Audio DSP
          </span>
          <span>Hardware DAC Output</span>
        </div>

      </div>
    </div>
  );
};
