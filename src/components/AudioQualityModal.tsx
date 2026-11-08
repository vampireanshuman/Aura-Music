import React from 'react';
import { useAudio } from '../context/AudioContext';
import { X, Sparkles, Check, Radio, Flame, Waves, Cpu, Activity, ShieldCheck } from 'lucide-react';
import { SOUND_QUALITY_SPECS, type SoundQualityMode } from '../utils/audioDSP';
import type { SpatialRoom, StreamingBitrate } from '../types/music';
import { triggerHaptic } from '../utils/haptics';
import { showIslandToast } from '../utils/islandToast';

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
    setSpatialRoom,
    settings,
    updateSettings
  } = useAudio();

  if (!isAudioQualityModalOpen) return null;

  const currentSpecs = SOUND_QUALITY_SPECS[soundQualityMode];

  const modes: { id: SoundQualityMode; name: string; tag: string; desc: string; glow: string; color: string }[] = [
    {
      id: 'hi-res-lossless',
      name: 'Hi-Res Audio Master',
      tag: '24-Bit / 192kHz ALAC',
      desc: 'Bit-for-bit studio master reproduction with ultrasonic headroom above 20kHz.',
      glow: 'shadow-[0_0_18px_rgba(245,158,11,0.35)] border-amber-400/50 bg-amber-500/10 text-amber-300',
      color: '#f59e0b'
    },
    {
      id: 'cd-lossless',
      name: 'CD Lossless',
      tag: '16-Bit / 44.1kHz',
      desc: 'Original Red Book CD quality. Zero lossy compression or audible artifacts.',
      glow: 'shadow-[0_0_18px_rgba(16,185,129,0.35)] border-emerald-400/50 bg-emerald-500/10 text-emerald-300',
      color: '#10b981'
    },
    {
      id: 'dolby-atmos',
      name: 'Dolby Atmos / Spatial Audio',
      tag: 'Binaural 3D Surround',
      desc: 'Immersive soundstage rendered with HRTF. Puts instruments in physical space around you.',
      glow: 'shadow-[0_0_18px_rgba(168,85,247,0.35)] border-purple-400/50 bg-purple-500/10 text-purple-300',
      color: '#a855f7'
    },
    {
      id: 'high-quality',
      name: 'High Quality AAC',
      tag: '320 kbps AAC-LC',
      desc: 'Transparent high-efficiency stream indistinguishable from master on mobile DACs.',
      glow: 'shadow-[0_0_14px_rgba(6,182,212,0.3)] border-cyan-400/40 bg-cyan-500/10 text-cyan-300',
      color: '#06b6d4'
    }
  ];

  const handleModeSelect = (mode: SoundQualityMode) => {
    triggerHaptic('success');
    setSoundQualityMode(mode);
    const spec = SOUND_QUALITY_SPECS[mode];
    showIslandToast(`✨ ${spec.badge} Active`);
  };

  const handleBitrateSelect = (bitrate: StreamingBitrate) => {
    triggerHaptic('selection');
    updateSettings({ streamingBitrate: bitrate });
  };

  return (
    <div 
      style={{ paddingTop: 'calc(var(--safe-top, 0px) + 12px)' }}
      className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/75 backdrop-blur-xl"
        onClick={() => {
          triggerHaptic('light');
          setIsAudioQualityModalOpen(false);
        }}
      />

      {/* Modal Sheet Container */}
      <div className="relative z-10 w-full max-w-lg max-h-[92vh] flex flex-col bg-[#141522]/90 border border-white/15 rounded-3xl p-5 sm:p-6 shadow-[0_25px_60px_rgba(0,0,0,0.85)] backdrop-blur-[40px] saturate-[220%] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-black/40"
              style={{ backgroundColor: currentTrack?.dominantColor || '#fa2d48' }}
            >
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">Audio Quality & Codecs</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold border border-emerald-500/30">
                  LOSSLESS
                </span>
              </div>
              <p className="text-xs text-white/50 mt-0.5">Audiophile Stream Pipeline & Hardware DAC Output</p>
            </div>
          </div>

          <button
            onClick={() => {
              triggerHaptic('light');
              setIsAudioQualityModalOpen(false);
            }}
            className="p-2 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors spring-button"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto mt-4 pr-1 space-y-4">
          
          {/* Active Codec Live Telemetry Box */}
          <div className="p-4 rounded-2xl bg-white/[0.035] border border-white/10 shadow-inner space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-white/50 font-semibold flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                Active Hardware Codec
              </span>
              <span className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                soundQualityMode === 'hi-res-lossless' ? 'bg-amber-500/15 text-amber-300 border-amber-400/40 shadow-[0_0_12px_rgba(245,158,11,0.3)]' :
                soundQualityMode === 'cd-lossless' ? 'bg-emerald-500/15 text-emerald-300 border-emerald-400/40 shadow-[0_0_12px_rgba(16,185,129,0.3)]' :
                soundQualityMode === 'dolby-atmos' ? 'bg-purple-500/15 text-purple-300 border-purple-400/40 shadow-[0_0_12px_rgba(168,85,247,0.3)]' :
                'bg-cyan-500/15 text-cyan-300 border-cyan-400/40'
              }`}>
                {currentSpecs.badge}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                <span className="text-white/40 block text-[9.5px] uppercase">Bit Depth</span>
                <span className="text-white font-bold">{currentTrack?.bitDepth || currentSpecs.bitDepth}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                <span className="text-white/40 block text-[9.5px] uppercase">Sample Rate</span>
                <span className="text-white font-bold">{currentTrack?.sampleRate || currentSpecs.sampleRate}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                <span className="text-white/40 block text-[9.5px] uppercase">Audio Codec</span>
                <span className="text-white font-bold">{currentSpecs.codec}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                <span className="text-white/40 block text-[9.5px] uppercase">Acoustic Staging</span>
                <span className="text-white font-bold">{currentSpecs.channels}</span>
              </div>
            </div>

            <p className="text-[11.5px] text-white/60 leading-relaxed pt-0.5">
              {currentSpecs.description}
            </p>
          </div>

          {/* Audio Quality & Processing Tier Selector */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-white/50 block">
              Audio Processing & Acoustic Pipeline
            </span>

            <div className="grid grid-cols-1 gap-2.5">
              {modes.map((m) => {
                const isSelected = soundQualityMode === m.id;

                return (
                  <div
                    key={m.id}
                    onClick={() => handleModeSelect(m.id)}
                    className={`cursor-pointer p-3.5 rounded-2xl border transition-all flex items-center justify-between spring-button ${
                      isSelected
                        ? `${m.glow} ring-1 ring-white/20`
                        : 'bg-white/[0.025] border-white/8 hover:bg-white/[0.05] hover:border-white/15'
                    }`}
                  >
                    <div className="pr-2">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white tracking-tight">
                          {m.name}
                        </h4>
                        <span className={`text-[10px] font-mono px-2 py-0.2 rounded-full font-bold border ${
                          isSelected ? 'bg-white/15 text-white border-white/30' : 'bg-white/5 text-white/60 border-white/10'
                        }`}>
                          {m.tag}
                        </span>
                      </div>
                      <p className="text-xs text-white/50 mt-1 leading-relaxed">
                        {m.desc}
                      </p>
                    </div>

                    <div className={`w-5 h-5 rounded-full flex items-center justify-center border shrink-0 transition-all ${
                      isSelected 
                        ? 'bg-white text-black border-white shadow-md' 
                        : 'border-white/20 text-transparent'
                    }`}>
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Live Bitrate Streaming Switcher on the Fly */}
          <div className="p-4 rounded-2xl bg-white/[0.035] border border-white/10 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-white/70 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-sky-400" />
                Live Network Streaming Bitrate
              </span>
              <span className="text-[10px] text-white/40 font-mono">Dynamic Switcher</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'lossless-alac' as StreamingBitrate, label: 'Lossless FLAC/ALAC', sub: '~920 - 2400 kbps' },
                { id: 'high-320' as StreamingBitrate, label: 'High (320 kbps)', sub: 'AAC-LC Studio' },
                { id: 'data-saver' as StreamingBitrate, label: 'Standard (160 kbps)', sub: 'Cellular Saver' },
              ].map((b) => {
                const isBitrateActive = settings.streamingBitrate === b.id;
                return (
                  <button
                    key={b.id}
                    onClick={() => handleBitrateSelect(b.id)}
                    className={`py-2 px-2.5 rounded-xl text-center border transition-all spring-button ${
                      isBitrateActive
                        ? 'bg-sky-500/20 border-sky-400 text-white font-bold shadow-md shadow-sky-500/20'
                        : 'bg-white/[0.02] border-white/10 text-white/60 hover:text-white hover:bg-white/[0.05]'
                    }`}
                  >
                    <span className="block text-xs font-semibold">{b.label}</span>
                    <span className="block text-[9.5px] text-white/40 font-mono mt-0.5">{b.sub}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Analog Tube Warmth & Virtual Room */}
          <div className="p-4 rounded-2xl bg-white/[0.035] border border-white/10 space-y-4">
            {/* Tube Warmth */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/80 font-semibold flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>Vacuum Tube Saturation (Triode Drive):</span>
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
                onChange={(e) => {
                  triggerHaptic('tick');
                  setTubeWarmth(Number(e.target.value));
                }}
                className="w-full h-1.5 accent-amber-400 cursor-pointer"
              />
              <div className="flex justify-between text-[9.5px] text-white/40 font-mono">
                <span>0 dB Linear</span>
                <span>+5 dB Vinyl Warmth</span>
                <span>+10 dB Rich Triode Harmonics</span>
              </div>
            </div>

            {/* Virtual Acoustic Room */}
            <div className="space-y-1.5 pt-1 border-t border-white/5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/80 font-semibold flex items-center gap-1.5">
                  <Waves className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Spatial Soundstage Convolver:</span>
                </span>
                <span className="font-mono font-bold text-indigo-300 uppercase text-[11px]">
                  {spatialRoom}
                </span>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {(['off', 'studio', 'concert', 'cathedral', 'lounge'] as SpatialRoom[]).map((room) => (
                  <button
                    key={room}
                    onClick={() => {
                      triggerHaptic('selection');
                      setSpatialRoom(room);
                    }}
                    className={`py-2 px-1 rounded-xl text-[10.5px] font-bold uppercase tracking-wider border transition-all spring-button ${
                      spatialRoom === room
                        ? 'bg-indigo-500/25 border-indigo-400 text-white shadow-sm'
                        : 'bg-white/[0.02] border-white/5 text-white/50 hover:text-white'
                    }`}
                  >
                    {room === 'concert' ? 'Arena' : room === 'lounge' ? 'Jazz' : room}
                  </button>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* Footer Hardware Info */}
        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-white/40 shrink-0">
          <span className="flex items-center gap-1.5 font-mono">
            <Radio className="w-3.5 h-3.5 text-[#fa2d48]" /> Web Audio 64-Bit Float Pipeline
          </span>
          <span className="flex items-center gap-1 text-emerald-400/80 font-mono">
            <ShieldCheck className="w-3.5 h-3.5" /> Bit-Perfect DAC
          </span>
        </div>

      </div>
    </div>
  );
};
