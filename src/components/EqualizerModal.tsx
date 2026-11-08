import React, { useState } from 'react';
import { useAudio } from '../context/AudioContext';
import { X, Sliders, Check, Headphones, Sparkles, RotateCcw } from 'lucide-react';
import type { EqualizerPreset } from '../types/music';
import { AUTO_EQ_PROFILES, type AutoEQProfile } from '../utils/autoEqData';

const PRESETS: { id: EqualizerPreset; label: string; desc: string }[] = [
  { id: 'flat', label: 'Flat (Studio Reference)', desc: 'Standard neutral response with original studio mastering.' },
  { id: 'bass-boost', label: 'Bass Booster', desc: 'Warm, punchy low-end emphasis for punchy kicks & 808s.' },
  { id: 'electronic', label: 'Electronic & Synth', desc: 'Crisp highs and heavy bass optimized for EDM & Synthwave.' },
  { id: 'acoustic', label: 'Acoustic & Vocals', desc: 'Clear mids and enhanced presence for vocals & acoustic guitars.' },
  { id: 'vocal-booster', label: 'Vocal Clarity Booster', desc: 'Amplified dialogue and lead vocals for maximum lyric intimacy.' },
  { id: 'rock', label: 'Rock & Dynamic Drive', desc: 'Dynamic energy for guitars, snare attacks, and live drum kits.' },
];

const FREQ_LABELS = ['60 Hz', '250 Hz', '1 kHz', '4 kHz', '12 kHz'];

export const EqualizerModal: React.FC = () => {
  const { 
    isEqualizerOpen, 
    setIsEqualizerOpen, 
    equalizerPreset, 
    setEqualizerPreset,
    selectedAutoEQ,
    setAutoEQ,
    currentTrack 
  } = useAudio();

  const [activeTab, setActiveTab] = useState<'presets' | 'autoeq'>('presets');
  const [selectedFilter, setSelectedFilter] = useState<'All' | 'Over-Ear' | 'In-Ear' | 'True Wireless'>('All');

  if (!isEqualizerOpen) return null;

  const filteredAutoEq = selectedFilter === 'All' 
    ? AUTO_EQ_PROFILES 
    : AUTO_EQ_PROFILES.filter(p => p.type === selectedFilter);

  return (
    <div 
      style={{ paddingTop: 'calc(var(--safe-top, 0px) + 12px)' }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in zoom-in-95 duration-200"
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={() => setIsEqualizerOpen(false)}
      />

      {/* Modal Dialog */}
      <div className="relative z-10 w-full max-w-xl max-h-[90vh] flex flex-col bg-[#12141f]/95 border border-white/10 rounded-3xl p-5 sm:p-6 shadow-2xl backdrop-blur-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div 
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-md"
              style={{ backgroundColor: currentTrack?.dominantColor || '#fa2d48' }}
            >
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">Audio Equalizer & DSP</h3>
                {selectedAutoEQ && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
                    AutoEQ Active
                  </span>
                )}
              </div>
              <p className="text-xs text-white/50">Studio audio profile tuning & Harman target calibration</p>
            </div>
          </div>

          <button
            onClick={() => setIsEqualizerOpen(false)}
            className="p-1.5 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher: Presets vs AutoEQ */}
        <div className="flex items-center gap-2 mt-4 p-1 rounded-2xl bg-white/[0.04] border border-white/5 shrink-0">
          <button
            onClick={() => setActiveTab('presets')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'presets'
                ? 'bg-white/15 text-white shadow-md'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Studio Presets</span>
          </button>

          <button
            onClick={() => setActiveTab('autoeq')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'autoeq'
                ? 'bg-[#fa2d48] text-white shadow-md shadow-[#fa2d48]/25'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Headphones className="w-3.5 h-3.5" />
            <span>AutoEQ Headphone Targets</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 font-bold">
              LastWave
            </span>
          </button>
        </div>

        {/* Content Area with scroll */}
        <div className="flex-1 overflow-y-auto mt-4 pr-1 space-y-4">
          
          {/* TAB 1: STUDIO PRESETS */}
          {activeTab === 'presets' && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-white/40 block">
                  5-Band Frequency Presets
                </span>
                {selectedAutoEQ && (
                  <button
                    onClick={() => setAutoEQ(null)}
                    className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" /> Disengage AutoEQ
                  </button>
                )}
              </div>

              {PRESETS.map((preset) => {
                const isSelected = !selectedAutoEQ && equalizerPreset === preset.id;
                return (
                  <div
                    key={preset.id}
                    onClick={() => {
                      setAutoEQ(null);
                      setEqualizerPreset(preset.id);
                    }}
                    className={`cursor-pointer flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                      isSelected
                        ? 'bg-white/10 border-white/30 shadow-lg'
                        : 'bg-white/[0.03] border-white/5 hover:bg-white/[0.06] hover:border-white/15'
                    }`}
                  >
                    <div>
                      <h4 className={`text-sm font-semibold flex items-center gap-2 ${
                        isSelected ? 'text-white' : 'text-white/80'
                      }`}>
                        {preset.label}
                        {isSelected && (
                          <span 
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: currentTrack?.dominantColor || '#fa2d48' }}
                          />
                        )}
                      </h4>
                      <p className="text-xs text-white/50 mt-0.5">{preset.desc}</p>
                    </div>

                    <div className={`w-5 h-5 rounded-full flex items-center justify-center border shrink-0 ${
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
          )}

          {/* TAB 2: AUTOEQ HEADPHONE CALIBRATION */}
          {activeTab === 'autoeq' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-950/40 to-[#12141f] border border-purple-500/20 text-xs text-white/80 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-purple-300">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  What is AutoEQ?
                </div>
                <p className="text-white/60 leading-relaxed">
                  Calibrated directly from Jaakkopasanen’s AutoEQ and LastWave databases. Compensates for headphone frequency quirks to match the world-standard <strong>Harman Target Curve</strong> for natural, lifelike acoustic reproduction.
                </p>
              </div>

              {/* Headphone Type Filter Buttons */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                {(['All', 'Over-Ear', 'In-Ear', 'True Wireless'] as const).map(type => (
                  <button
                    key={type}
                    onClick={() => setSelectedFilter(type)}
                    className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-colors ${
                      selectedFilter === type 
                        ? 'bg-white text-black font-semibold' 
                        : 'bg-white/5 text-white/60 hover:text-white'
                    }`}
                  >
                    {type}
                  </button>
                ))}

                {selectedAutoEQ && (
                  <button
                    onClick={() => setAutoEQ(null)}
                    className="ml-auto text-xs px-2.5 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/20 flex items-center gap-1 whitespace-nowrap"
                  >
                    <RotateCcw className="w-3 h-3" /> Turn Off AutoEQ
                  </button>
                )}
              </div>

              {/* Profiles List */}
              <div className="space-y-2.5">
                {filteredAutoEq.map((profile: AutoEQProfile) => {
                  const isSelected = selectedAutoEQ === profile.id;
                  return (
                    <div
                      key={profile.id}
                      onClick={() => setAutoEQ(profile.id)}
                      className={`cursor-pointer p-4 rounded-2xl border transition-all ${
                        isSelected
                          ? 'bg-purple-900/25 border-purple-500/40 shadow-lg ring-1 ring-purple-500/30'
                          : 'bg-white/[0.03] border-white/5 hover:bg-white/[0.06] hover:border-white/15'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
                              {profile.brand}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/10 text-white/60">
                              {profile.type}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-semibold">
                              {profile.target}
                            </span>
                          </div>

                          <h4 className={`text-sm font-bold mt-1 ${isSelected ? 'text-white' : 'text-white/90'}`}>
                            {profile.name}
                          </h4>
                          <p className="text-xs text-white/50 mt-1 leading-relaxed">
                            {profile.description}
                          </p>
                        </div>

                        <div className={`w-5 h-5 rounded-full flex items-center justify-center border shrink-0 mt-1 ${
                          isSelected 
                            ? 'bg-purple-500 border-purple-500 text-white shadow-md shadow-purple-500/40' 
                            : 'border-white/20 text-transparent'
                        }`}>
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      </div>

                      {/* 5-Band Gain Preview */}
                      <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-white/40">
                        {profile.gains.map((gain, i) => (
                          <div key={i} className="flex flex-col items-center">
                            <span className={`font-semibold ${gain > 0 ? 'text-emerald-400' : gain < 0 ? 'text-rose-400' : 'text-white/40'}`}>
                              {gain > 0 ? `+${gain.toFixed(1)}` : `${gain.toFixed(1)}`}dB
                            </span>
                            <span className="text-white/30 text-[9px]">{FREQ_LABELS[i]}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Footer info */}
        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-white/40 shrink-0">
          <span>Real-time Biquad Filter Processing</span>
          <span>5-Band Linear DSP</span>
        </div>
      </div>
    </div>
  );
};
