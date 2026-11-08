import React, { useState } from 'react';
import { useAudio } from '../context/AudioContext';
import { 
  X, 
  Sliders, 
  Check, 
  Headphones, 
  Sparkles, 
  RotateCcw, 
  Waves, 
  Flame, 
  Compass
} from 'lucide-react';
import type { EqualizerPreset, SpatialRoom } from '../types/music';
import { AUTO_EQ_PROFILES, type AutoEQProfile } from '../utils/autoEqData';
import { triggerHaptic } from '../utils/haptics';
import { showIslandToast } from '../utils/islandToast';

const PRESETS: { id: EqualizerPreset; label: string; desc: string; icon: string }[] = [
  { id: 'flat', label: 'Flat (Studio Reference)', desc: 'Pure neutral studio mastering curve without coloration.', icon: '🎯' },
  { id: 'cd-lossless', label: 'CD Lossless Warmth', desc: 'Analog tape saturation curve with airy high-frequency sheen.', icon: '💿' },
  { id: 'bass-boost', label: 'Bass Booster', desc: 'Deep punchy 808 sub-bass low-end emphasis for hip-hop & EDM.', icon: '🔊' },
  { id: 'vocal-booster', label: 'Vocal Clarity', desc: 'Enhanced presence for speech, lead vocals, and acoustic intimacy.', icon: '🎤' },
  { id: 'spatial-surround', label: 'Spatial Surround', desc: 'Wide 3D binaural dispersion with extended dynamic headroom.', icon: '🌐' },
  { id: 'electronic', label: 'Electronic & Synth', desc: 'Punchy transients and crisp highs for synthwave & dance tracks.', icon: '⚡' },
  { id: 'rock', label: 'Rock & Dynamic Drive', desc: 'Aggressive guitars and punchy snare drum attack.', icon: '🎸' },
  { id: 'acoustic', label: 'Acoustic & Unplugged', desc: 'Natural woody reverberation and string resonance.', icon: '🎻' },
];

const BANDS = [
  { freq: '60 Hz', label: 'Sub-Bass', desc: 'Sub-frequencies & 808 rumble' },
  { freq: '250 Hz', label: 'Low-Mid', desc: 'Bass warmth & drum body' },
  { freq: '1 kHz', label: 'Midrange', desc: 'Vocal fundamentals & rhythm' },
  { freq: '4 kHz', label: 'Presence', desc: 'Vocal clarity & consonants' },
  { freq: '16 kHz', label: 'Air Treble', desc: 'Studio air & cymbal shimmer' },
];

export const EqualizerModal: React.FC = () => {
  const { 
    isEqualizerOpen, 
    setIsEqualizerOpen, 
    equalizerPreset, 
    setEqualizerPreset,
    eqGains,
    setEqBandGain,
    selectedAutoEQ,
    setAutoEQ,
    currentTrack,
    spatialRoom,
    setSpatialRoom,
    tubeWarmth,
    setTubeWarmth
  } = useAudio();

  const [activeTab, setActiveTab] = useState<'equalizer' | 'soundstage' | 'autoeq'>('equalizer');
  const [selectedFilter, setSelectedFilter] = useState<'All' | 'Over-Ear' | 'In-Ear' | 'True Wireless'>('All');

  if (!isEqualizerOpen) return null;

  const filteredAutoEq = selectedFilter === 'All' 
    ? AUTO_EQ_PROFILES 
    : AUTO_EQ_PROFILES.filter(p => p.type === selectedFilter);

  const handlePresetClick = (preset: EqualizerPreset) => {
    triggerHaptic('medium');
    setEqualizerPreset(preset);
    showIslandToast(`🎛 EQ Preset: ${preset.toUpperCase()}`);
  };

  const handleBandSliderChange = (bandIndex: number, gainDb: number) => {
    triggerHaptic('tick');
    setEqBandGain(bandIndex, gainDb);
  };

  const handleResetFlat = () => {
    triggerHaptic('medium');
    setEqualizerPreset('flat');
    showIslandToast('🎛 EQ Reset to Flat (0dB)');
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
          setIsEqualizerOpen(false);
        }}
      />

      {/* Modal Dialog Sheet */}
      <div className="relative z-10 w-full max-w-xl max-h-[92vh] flex flex-col bg-[#12141f]/90 border border-white/15 rounded-3xl p-5 sm:p-6 shadow-[0_25px_60px_rgba(0,0,0,0.85)] backdrop-blur-[40px] saturate-[220%] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-black/40"
              style={{ backgroundColor: currentTrack?.dominantColor || '#fa2d48' }}
            >
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">Studio Equalizer & Soundstage</h3>
                {selectedAutoEQ ? (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
                    AutoEQ Active
                  </span>
                ) : equalizerPreset === 'custom' ? (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                    Custom Tuning
                  </span>
                ) : (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/80 font-mono font-bold">
                    {equalizerPreset.toUpperCase()}
                  </span>
                )}
              </div>
              <p className="text-xs text-white/50">Precision 5-Band Biquad Filters & Virtual Soundstage</p>
            </div>
          </div>

          <button
            onClick={() => {
              triggerHaptic('light');
              setIsEqualizerOpen(false);
            }}
            className="p-2 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors spring-button"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3-Way Tab Switcher: Equalizer | Soundstage | AutoEQ */}
        <div className="flex items-center gap-1.5 mt-4 p-1 rounded-2xl bg-white/[0.04] border border-white/8 shrink-0">
          <button
            onClick={() => {
              triggerHaptic('heavy');
              setActiveTab('equalizer');
            }}
            className={`flex-1 py-2 px-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-all spring-button ${
              activeTab === 'equalizer'
                ? 'bg-white/15 text-white shadow-md'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Studio EQ</span>
          </button>

          <button
            onClick={() => {
              triggerHaptic('heavy');
              setActiveTab('soundstage');
            }}
            className={`flex-1 py-2 px-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-all spring-button ${
              activeTab === 'soundstage'
                ? 'bg-white/15 text-white shadow-md'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Soundstage</span>
          </button>

          <button
            onClick={() => {
              triggerHaptic('heavy');
              setActiveTab('autoeq');
            }}
            className={`flex-1 py-2 px-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-all spring-button ${
              activeTab === 'autoeq'
                ? 'bg-[#fa2d48] text-white shadow-md shadow-[#fa2d48]/25'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Headphones className="w-3.5 h-3.5" />
            <span>AutoEQ</span>
          </button>
        </div>

        {/* Scrollable Main Content */}
        <div className="flex-1 overflow-y-auto mt-4 pr-1 space-y-4">
          
          {/* TAB 1: STUDIO EQUALIZER */}
          {activeTab === 'equalizer' && (
            <div className="space-y-4">
              
              {/* Interactive 5-Band Vertical Frequency Sliders */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.035] border border-white/10 shadow-inner">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-white/70">
                      5-Band Linear Biquad Sliders
                    </span>
                    <span className="text-[10px] text-white/40 font-mono">(-12dB to +12dB)</span>
                  </div>
                  
                  <button
                    onClick={handleResetFlat}
                    className="text-xs text-white/50 hover:text-white flex items-center gap-1 py-1 px-2.5 rounded-lg hover:bg-white/10 transition-colors spring-button"
                    title="Reset all bands to 0 dB"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset Flat</span>
                  </button>
                </div>

                {/* Vertical Sliders Grid */}
                <div className="grid grid-cols-5 gap-2 sm:gap-4 items-end justify-items-center py-2">
                  {BANDS.map((band, idx) => {
                    const gain = eqGains[idx] || 0;
                    return (
                      <div key={band.freq} className="flex flex-col items-center gap-2.5 w-full">
                        {/* dB Value Pill */}
                        <span className={`text-[11px] font-mono font-bold px-1.5 py-0.5 rounded-md tabular-nums ${
                          gain > 0 
                            ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' 
                            : gain < 0 
                            ? 'text-rose-400 bg-rose-500/10 border border-rose-500/20' 
                            : 'text-white/40 bg-white/5'
                        }`}>
                          {gain > 0 ? `+${gain.toFixed(1)}` : `${gain.toFixed(1)}`}
                        </span>

                        {/* High-fidelity Vertical Slider track */}
                        <div className="relative h-36 sm:h-40 w-8 flex items-center justify-center">
                          {/* Center 0dB Reference Line */}
                          <div className="absolute top-1/2 inset-x-1 h-[1px] bg-white/20 pointer-events-none -translate-y-1/2 z-0" />

                          <input
                            type="range"
                            min={-12}
                            max={12}
                            step={0.5}
                            value={gain}
                            onChange={(e) => handleBandSliderChange(idx, Number(e.target.value))}
                            className="accent-white cursor-pointer -rotate-90 w-32 sm:w-36 h-2 bg-white/15 rounded-full appearance-none group"
                            style={{ margin: 'auto' }}
                          />
                        </div>

                        {/* Frequency & Label */}
                        <div className="text-center">
                          <span className="block text-xs font-mono font-bold text-white tracking-tight">
                            {band.freq}
                          </span>
                          <span className="block text-[9.5px] text-white/40 truncate max-w-[65px]">
                            {band.label}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* One-Tap Acoustic Presets Grid */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-white/50 block">
                    One-Tap Acoustic Master Presets
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {PRESETS.map((preset) => {
                    const isSelected = !selectedAutoEQ && equalizerPreset === preset.id;
                    return (
                      <div
                        key={preset.id}
                        onClick={() => handlePresetClick(preset.id)}
                        className={`cursor-pointer p-3 rounded-2xl border transition-all flex items-start justify-between spring-button ${
                          isSelected
                            ? 'bg-white/15 border-white/40 shadow-lg ring-1 ring-white/25'
                            : 'bg-white/[0.025] border-white/5 hover:bg-white/[0.06] hover:border-white/15'
                        }`}
                      >
                        <div className="pr-2">
                          <h4 className={`text-xs sm:text-sm font-bold flex items-center gap-1.5 ${
                            isSelected ? 'text-white' : 'text-white/85'
                          }`}>
                            <span>{preset.icon}</span>
                            <span>{preset.label}</span>
                          </h4>
                          <p className="text-[11px] text-white/45 mt-0.5 leading-snug">
                            {preset.desc}
                          </p>
                        </div>

                        <div className={`w-4 h-4 rounded-full flex items-center justify-center border shrink-0 mt-0.5 ${
                          isSelected 
                            ? 'bg-white text-black border-white' 
                            : 'border-white/20 text-transparent'
                        }`}>
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: SPATIAL SOUNDSTAGE DRAWER */}
          {activeTab === 'soundstage' && (
            <div className="space-y-4">
              
              {/* Virtual Acoustic Room Convolver */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.035] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Waves className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-white/80">
                      Virtual Acoustic Room (Impulse Convolver)
                    </span>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-indigo-300 uppercase px-2 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/30">
                    {spatialRoom}
                  </span>
                </div>

                <p className="text-xs text-white/50 leading-relaxed">
                  Convolves audio with synthetic binaural room impulse responses to replicate physical room acoustics.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
                  {[
                    { id: 'off' as SpatialRoom, label: 'Direct Off', desc: 'Dry signal' },
                    { id: 'studio' as SpatialRoom, label: 'Studio Room', desc: 'Treated acoustics' },
                    { id: 'concert' as SpatialRoom, label: 'Concert Arena', desc: 'Live stage' },
                    { id: 'cathedral' as SpatialRoom, label: '8D Cathedral', desc: 'Cavernous space' },
                    { id: 'lounge' as SpatialRoom, label: 'Jazz Lounge', desc: 'Warm intimate' },
                  ].map((room) => (
                    <button
                      key={room.id}
                      onClick={() => {
                        triggerHaptic('medium');
                        setSpatialRoom(room.id);
                        showIslandToast(`🌐 Soundstage: ${room.label}`);
                      }}
                      className={`p-2.5 rounded-xl text-center border transition-all spring-button ${
                        spatialRoom === room.id
                          ? 'bg-indigo-500/25 border-indigo-400 text-white font-bold shadow-md shadow-indigo-500/25'
                          : 'bg-white/[0.02] border-white/10 text-white/60 hover:text-white hover:bg-white/[0.05]'
                      }`}
                    >
                      <span className="block text-xs font-semibold">{room.label}</span>
                      <span className="block text-[9.5px] text-white/40 mt-0.5">{room.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Vacuum Tube Saturation (Triode Warmth) */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.035] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-white/80">
                      Analog Tube Saturation (Triode Drive)
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-amber-400">
                    {tubeWarmth > 0 ? `+${tubeWarmth.toFixed(1)} dB Warmth` : 'Pure Digital (0 dB)'}
                  </span>
                </div>

                <p className="text-xs text-white/50 leading-relaxed">
                  Injects 2nd- and 3rd-order musical even harmonics through a non-linear triode grid transfer curve for lush vinyl warmth.
                </p>

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
                  className="w-full h-2 accent-amber-400 cursor-pointer"
                />

                <div className="flex justify-between text-[10px] text-white/40 font-mono">
                  <span>0 dB Transparent</span>
                  <span>+5 dB Vinyl Warmth</span>
                  <span>+10 dB Rich Triode Glow</span>
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: AUTOEQ HEADPHONE CALIBRATION */}
          {activeTab === 'autoeq' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-950/40 to-[#12141f] border border-purple-500/20 text-xs text-white/80 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-purple-300">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  What is AutoEQ?
                </div>
                <p className="text-white/60 leading-relaxed">
                  Calibrated directly from Jaakkopasanen’s AutoEQ and LastWave databases. Neutralizes headphone driver quirks to match the world-standard <strong>Harman Target Curve</strong>.
                </p>
              </div>

              {/* Headphone Type Filter Buttons */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                {(['All', 'Over-Ear', 'In-Ear', 'True Wireless'] as const).map(type => (
                  <button
                    key={type}
                    onClick={() => {
                      triggerHaptic('selection');
                      setSelectedFilter(type);
                    }}
                    className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-colors spring-button ${
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
                    onClick={() => {
                      triggerHaptic('medium');
                      setAutoEQ(null);
                    }}
                    className="ml-auto text-xs px-2.5 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/20 flex items-center gap-1 whitespace-nowrap spring-button"
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
                      onClick={() => {
                        triggerHaptic('success');
                        setAutoEQ(profile.id);
                        showIslandToast(`🎧 AutoEQ: ${profile.name}`);
                      }}
                      className={`cursor-pointer p-4 rounded-2xl border transition-all spring-button ${
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
                            <span className="text-white/30 text-[9px]">{BANDS[i]?.freq}</span>
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

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-white/40 shrink-0">
          <span>Real-time Biquad Filter Processing</span>
          <span>5-Band Linear DSP • Hardware DAC</span>
        </div>
      </div>
    </div>
  );
};
