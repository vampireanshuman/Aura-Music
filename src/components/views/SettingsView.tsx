import React, { useState, useRef } from 'react';
import { useAudio } from '../../context/AudioContext';
import { 
  Settings, 
  Trash2, 
  Headphones, 
  Eye, 
  Check, 
  Moon, 
  Gauge, 
  RotateCcw, 
  Download, 
  Upload, 
  Globe, 
  Zap, 
  Mic2,
  Sparkles,
  Smartphone,
  Radio,
  Flame,
  Waves
} from 'lucide-react';
import type { 
  LyricsFontSize, 
  ThemeAccent, 
  BackgroundStyle, 
  PlaybackBarAnimation, 
  SoundbarStyle, 
  LyricsAlignment, 
  TargetLufs, 
  CrossfadeCurve, 
  BufferPreload, 
  StreamingBitrate, 
  ContentRegion,
  RecommendationMode,
  CulturalPreference,
  SpatialRoom,
  VisualizerMode
} from '../../types/music';
import { AUTO_EQ_PROFILES } from '../../utils/autoEqData';

export const SettingsView: React.FC = () => {
  const { 
    settings, 
    updateSettings, 
    soundQualityMode, 
    setSoundQualityMode,
    selectedAutoEQ,
    setAutoEQ,
    playbackSpeed,
    setPlaybackSpeed,
    sleepTimerMinutes,
    setSleepTimer,
    activeThemeColor,
    favorites,
    playlists,
    exportLibraryData,
    importLibraryData,
    tubeWarmth,
    setTubeWarmth,
    spatialRoom,
    setSpatialRoom,
    visualizerMode,
    setVisualizerMode
  } = useAudio();

  const [importStatus, setImportStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const soundModes: { id: typeof soundQualityMode; title: string; desc: string; badge: string }[] = [
    { 
      id: 'dolby-atmos', 
      title: 'Dolby Atmos Spatial Audio', 
      desc: '3D acoustic soundstage rendered with Head-Related Transfer Functions (HRTF).',
      badge: 'Spatial 3D'
    },
    { 
      id: 'hi-res-lossless', 
      title: 'Hi-Res Lossless Master', 
      desc: '24-bit / 192 kHz ALAC studio master recording with extended dynamic range.',
      badge: '24-Bit / 192kHz'
    },
    { 
      id: 'cd-lossless', 
      title: 'Lossless CD Quality', 
      desc: '16-bit / 44.1 kHz bit-for-bit uncompressed studio playback.',
      badge: 'CD Quality'
    },
    { 
      id: 'high-quality', 
      title: 'High Quality AAC', 
      desc: '320 kbps stream optimized for bandwidth and standard wireless earbuds.',
      badge: '320 kbps'
    },
  ];

  const themeAccents: { id: ThemeAccent; label: string; color: string }[] = [
    { id: 'dynamic', label: 'Dynamic Track', color: activeThemeColor },
    { id: 'apple-rose', label: 'Apple Rose', color: '#fa2d48' },
    { id: 'cyber-cyan', label: 'Cyber Cyan', color: '#06b6d4' },
    { id: 'emerald', label: 'Emerald Matrix', color: '#10b981' },
    { id: 'sunset-amber', label: 'Sunset Amber', color: '#f59e0b' },
    { id: 'royal-purple', label: 'Royal Violet', color: '#a855f7' },
    { id: 'electric-blue', label: 'Studio Blue', color: '#3b82f6' },
    { id: 'oled-white', label: 'OLED White', color: '#f8fafc' },
  ];

  const backgroundStyles: { id: BackgroundStyle; label: string; desc: string }[] = [
    { id: 'mesh-fluid', label: 'Fluid Mesh Glow', desc: 'Apple Music animated floating color blobs' },
    { id: 'audio-reactive', label: 'Audio Reactive', desc: 'Blobs pulse and scale dynamically to music tempo' },
    { id: 'minimal-glass', label: 'Minimal Glass', desc: 'Subtle frosted static background' },
    { id: 'oled-pure-black', label: 'OLED Pure Black', desc: '0-nit true pitch black for OLED battery saving' },
  ];

  const lineAnimationStyles: { id: PlaybackBarAnimation; label: string }[] = [
    { id: 'shimmer', label: 'Liquid Wave Shimmer' },
    { id: 'pulse', label: 'Neon Laser Pulse' },
    { id: 'clean', label: 'Solid Minimal Precision' },
  ];

  const soundbarStyles: { id: SoundbarStyle; label: string }[] = [
    { id: 'apple-4bars', label: 'Apple Music 4-Bars' },
    { id: 'audiophile-8bars', label: 'Audiophile 8-Bars' },
    { id: 'subtle-3bars', label: 'Compact 3-Bars' },
    { id: 'off', label: 'Hidden (Off)' },
  ];

  const lyricsSizes: { id: LyricsFontSize; label: string }[] = [
    { id: 'normal', label: 'Standard' },
    { id: 'large', label: 'Large (Recommended)' },
    { id: 'huge', label: 'Extra Large' },
  ];

  const lyricsAlignments: { id: LyricsAlignment; label: string }[] = [
    { id: 'center', label: 'Center (Karaoke)' },
    { id: 'left', label: 'Left (Reading)' },
  ];

  const lufsTargets: { id: TargetLufs; label: string; desc: string }[] = [
    { id: 'apple', label: 'Apple Music (-16 LUFS)', desc: 'Standard target with generous natural dynamic range' },
    { id: 'spotify', label: 'Spotify (-14 LUFS)', desc: 'Slightly hotter modern streaming loudness' },
    { id: 'broadcast', label: 'EBU R128 (-23 LUFS)', desc: 'Audiophile wide broadcast reference' },
    { id: 'off', label: 'Off (Native Gain)', desc: 'Raw unnormalized track loudness' },
  ];

  const crossfadeCurves: { id: CrossfadeCurve; label: string }[] = [
    { id: 'smooth', label: 'Smooth S-Curve' },
    { id: 'linear', label: 'Linear' },
    { id: 'exponential', label: 'Exponential' },
  ];

  const bufferModes: { id: BufferPreload; label: string; desc: string }[] = [
    { id: 'balanced', label: 'Balanced (30s)', desc: 'Recommended default for smooth streaming' },
    { id: 'low-latency', label: 'Low Latency (5s)', desc: 'Instant song switching on high-speed internet' },
    { id: 'full-track', label: 'Audiophile Mega-Buffer', desc: 'Pre-caches 100% of song in RAM for zero drops' },
  ];

  const bitrateProfiles: { id: StreamingBitrate; label: string }[] = [
    { id: 'lossless-alac', label: 'Lossless ALAC Master' },
    { id: 'high-320', label: 'High Quality 320 kbps' },
    { id: 'auto', label: 'Adaptive Auto' },
    { id: 'data-saver', label: 'Data Saver (128 kbps)' },
  ];

  const contentRegions: { id: ContentRegion; label: string; flag: string }[] = [
    { id: 'GLOBAL', label: 'Worldwide Global', flag: '🌍' },
    { id: 'IN', label: 'India (Bollywood & Punjabi)', flag: '🇮🇳' },
    { id: 'US', label: 'United States', flag: '🇺🇸' },
    { id: 'GB', label: 'United Kingdom', flag: '🇬🇧' },
    { id: 'JP', label: 'Japan (Oricon)', flag: '🇯🇵' },
    { id: 'KR', label: 'South Korea (K-Pop)', flag: '🇰🇷' },
    { id: 'DE', label: 'Germany', flag: '🇩🇪' },
  ];

  const recommendationModes: { id: RecommendationMode; label: string; desc: string; badge?: string }[] = [
    {
      id: 'strict-cultural',
      label: 'Strict Cultural Separation',
      desc: 'Guarantees Bollywood stays with Bollywood, Punjabi with Punjabi, and Western Pop with Western Pop. Never recommends Hollywood sad songs while enjoying Indian music.',
      badge: 'Recommended'
    },
    {
      id: 'smart-blend',
      label: 'Smart Acoustic Harmonization',
      desc: 'Blends by tempo, acoustic key, and energy while honoring primary language preferences.',
    },
    {
      id: 'global-eclectic',
      label: 'Global Eclectic Discovery',
      desc: 'Open cross-genre exploration across worldwide charts and genres.',
    }
  ];

  const culturalPreferences: { id: CulturalPreference; label: string; desc: string }[] = [
    { id: 'auto', label: 'Auto (Active Song Context)', desc: 'Automatically matches whatever culture or language you are currently playing' },
    { id: 'bollywood', label: 'Bollywood & Hindi Core', desc: 'Focus on Arijit Singh, Pritam, Shreya Ghoshal, and soulful Hindi melodies' },
    { id: 'punjabi', label: 'Punjabi Wave Core', desc: 'Focus on Diljit Dosanjh, Karan Aujla, AP Dhillon, and high-energy Bhangra' },
    { id: 'western-pop', label: 'Global Pop & R&B Core', desc: 'Focus on The Weeknd, Billie Eilish, Sabrina Carpenter, and modern synthpop' },
    { id: 'all', label: 'All Cultures (Omni-Universe)', desc: 'Unrestricted recommendation across all musical worlds' },
  ];

  const handleExportBackup = () => {
    const jsonStr = exportLibraryData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aura_music_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const ok = importLibraryData(content);
      if (ok) {
        setImportStatus('Library successfully restored!');
        setTimeout(() => setImportStatus(null), 4000);
      } else {
        setImportStatus('Error: Invalid backup file format.');
        setTimeout(() => setImportStatus(null), 4000);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClearCache = () => {
    if (confirm('Are you sure you want to clear your local audio cache and settings?')) {
      localStorage.removeItem('aura_favorites');
      localStorage.removeItem('aura_playlists');
      localStorage.removeItem('aura_settings');
      localStorage.removeItem('aura_recently_played');
      window.location.reload();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-9 font-sans" style={{ paddingBottom: 'calc(160px + var(--safe-bottom, 22px))' }}>
      {/* iOS 18 Premium Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#fa2d48]">
            <Settings className="w-4 h-4" /> Studio Master Settings & Customization
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-title-primary tracking-tight mt-1">
            Settings
          </h1>
          <p className="text-xs sm:text-sm text-meta-secondary mt-1 max-w-xl leading-relaxed">
            Configure high-fidelity studio DSP, AutoEQ headphone curves, cultural recommendation AI, and personalized visual aesthetics.
          </p>
        </div>

        <div className="self-start sm:self-center px-4 py-2 rounded-2xl glass-pill text-xs font-semibold text-meta-secondary flex items-center gap-2.5 shadow-lg">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
          <span>Aura Pro v2.5 Audiophile Engine</span>
        </div>
      </div>

      {/* ============================================================== */}
      {/* SECTION 1: AUDIOPHILE & STUDIO DSP ENGINE                      */}
      {/* ============================================================== */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#fa2d48] to-rose-600 flex items-center justify-center text-white shadow-md">
              <Headphones className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-title-primary tracking-tight">
              Studio DSP & Audiophile Sound Engine
            </h2>
          </div>
          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
            32-Bit Float DSP
          </span>
        </div>

        <div className="glass-sheet rounded-[24px] p-5 sm:p-6 divide-y divide-white/[0.06] space-y-5 shadow-2xl">
          {/* Sound Quality Mode */}
          <div className="space-y-2.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-white/45 block">
              Audiophile Master Resolution & Spatial Preset
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {soundModes.map((q) => {
                const isSelected = soundQualityMode === q.id;
                return (
                  <div
                    key={q.id}
                    onClick={() => setSoundQualityMode(q.id)}
                    className={`cursor-pointer p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-white/10 border-white/30 shadow-lg ring-1 ring-white/20'
                        : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-white flex items-center gap-2">
                          {q.title}
                          {q.badge && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#fa2d48]/20 text-[#fa2d48] font-mono font-bold border border-[#fa2d48]/30">
                              {q.badge}
                            </span>
                          )}
                        </span>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-[#fa2d48] flex items-center justify-center text-white shadow-md">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-white/50 mt-1.5 leading-relaxed">{q.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AutoEQ Headphone Profile Selector */}
          <div className="pt-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-white">AutoEQ Headphone Target Compensation</h4>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
                    Harman Target
                  </span>
                </div>
                <p className="text-xs text-white/50 mt-0.5">
                  Calibrated frequency compensation for AirPods Pro 2, Sony XM5, Sennheiser HD650, Audio-Technica, and IEMs.
                </p>
              </div>

              {selectedAutoEQ && (
                <button
                  onClick={() => setAutoEQ(null)}
                  className="text-xs px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-white/70 hover:text-white flex items-center gap-1 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" /> Turn Off
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {AUTO_EQ_PROFILES.slice(0, 6).map((profile) => {
                const isSelected = selectedAutoEQ === profile.id;
                return (
                  <div
                    key={profile.id}
                    onClick={() => setAutoEQ(isSelected ? null : profile.id)}
                    className={`cursor-pointer p-3 rounded-2xl border transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-purple-950/40 border-purple-500/40 ring-1 ring-purple-500/30 shadow-md'
                        : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05]'
                    }`}
                  >
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-purple-400">
                        {profile.brand}
                      </span>
                      <h5 className="text-xs font-bold text-white">{profile.name}</h5>
                    </div>

                    <div className={`w-4 h-4 rounded-full flex items-center justify-center border ${
                      isSelected ? 'bg-purple-500 border-purple-500 text-white' : 'border-white/20 text-transparent'
                    }`}>
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Stereo Soundstage Widener */}
          <div className="pt-5 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-white">Stereo Soundstage Widener</h4>
                <p className="text-xs text-white/50 mt-0.5">
                  Expand stereo acoustic headroom beyond headphone boundaries (0% Mono to 200% Ultra-Wide 3D).
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-purple-300 bg-purple-500/20 px-2.5 py-0.5 rounded-full">
                {settings.stereoWidth ?? 100}%
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={200}
              step={5}
              value={settings.stereoWidth ?? 100}
              onChange={(e) => updateSettings({ stereoWidth: Number(e.target.value) })}
              className="w-full h-1.5 accent-purple-500 cursor-pointer"
            />
          </div>

          {/* Sub-Bass Exciter & Cutoff */}
          <div className="pt-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-white">Sub-Bass Deep Punch Exciter</h4>
                <p className="text-xs text-white/50 mt-0.5">
                  Enhance low-end sub-bass resonance and physical tactile punch without muddying mid-frequencies.
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-[#fa2d48] bg-[#fa2d48]/20 px-2.5 py-0.5 rounded-full">
                +{settings.subBassBoost ?? 0} dB @ {settings.bassCutoff ?? 60}Hz
              </span>
            </div>

            <div className="space-y-2">
              <input
                type="range"
                min={0}
                max={12}
                step={0.5}
                value={settings.subBassBoost ?? 0}
                onChange={(e) => updateSettings({ subBassBoost: Number(e.target.value) })}
                className="w-full h-1.5 accent-[#fa2d48] cursor-pointer"
              />
              <div className="flex items-center gap-2 pt-1">
                <span className="text-xs text-white/50">Resonance Cutoff:</span>
                {[40, 60, 80, 120].map((hz) => (
                  <button
                    key={hz}
                    onClick={() => updateSettings({ bassCutoff: hz as any })}
                    className={`px-2.5 py-1 rounded-xl text-xs font-semibold border transition-all ${
                      (settings.bassCutoff ?? 60) === hz
                        ? 'bg-[#fa2d48] text-white border-[#fa2d48] shadow-sm font-bold'
                        : 'bg-white/[0.03] border-white/10 text-white/60 hover:text-white'
                    }`}
                  >
                    {hz}Hz
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Loudness Target (LUFS Normalization) */}
          <div className="pt-5 space-y-2.5">
            <div>
              <h4 className="text-sm font-semibold text-white">Loudness Normalization (ReplayGain Target)</h4>
              <p className="text-xs text-white/50 mt-0.5">
                Automatically adjusts disparate track volumes so you never have to scramble for the volume slider.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {lufsTargets.map(target => (
                <div
                  key={target.id}
                  onClick={() => updateSettings({ targetLufs: target.id })}
                  className={`cursor-pointer p-3 rounded-2xl border transition-all ${
                    (settings.targetLufs || 'apple') === target.id
                      ? 'bg-white/10 border-white/30 text-white shadow-md'
                      : 'bg-white/[0.02] border-white/5 text-white/60 hover:text-white'
                  }`}
                >
                  <div className="text-xs font-bold text-white">{target.label}</div>
                  <div className="text-[11px] text-white/40 mt-0.5">{target.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Audio Crossfade */}
          <div className="pt-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-white">Continuous Song Crossfade</h4>
                <p className="text-xs text-white/50 mt-0.5">
                  Eliminates silence between songs with studio DJ crossfading.
                </p>
              </div>
              <span className="text-xs font-mono text-white/70 bg-white/10 px-2 py-0.5 rounded-full">
                {settings.crossfade === 0 ? 'Gapless (0s)' : `${settings.crossfade} seconds`}
              </span>
            </div>

            <input
              type="range"
              min={0}
              max={12}
              step={1}
              value={settings.crossfade}
              onChange={(e) => updateSettings({ crossfade: Number(e.target.value) })}
              className="w-full h-1.5 accent-[#fa2d48] cursor-pointer"
            />

            <div className="flex items-center gap-2 pt-1">
              <span className="text-xs text-white/50">Crossfade Curve:</span>
              {crossfadeCurves.map(curve => (
                <button
                  key={curve.id}
                  onClick={() => updateSettings({ crossfadeCurve: curve.id })}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold border transition-all ${
                    (settings.crossfadeCurve || 'smooth') === curve.id
                      ? 'bg-white/15 border-white/30 text-white font-bold'
                      : 'bg-white/[0.02] border-white/5 text-white/60 hover:text-white'
                  }`}
                >
                  {curve.label}
                </button>
              ))}
            </div>
          </div>

          {/* Analog Vacuum Tube Warmth (Triode Saturation) */}
          <div className="pt-5 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-500" />
                <div>
                  <h4 className="text-sm font-semibold text-white">Analog Vacuum Tube Saturation</h4>
                  <p className="text-xs text-white/50 mt-0.5">
                    12AX7 triode tube simulation. Generates musical 2nd & 3rd order even harmonics for warm vinyl/tape texture.
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/20 px-2.5 py-0.5 rounded-full">
                {tubeWarmth === 0 ? 'Pure Digital (0 dB)' : `+${tubeWarmth.toFixed(1)} dB Warmth`}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={10}
              step={0.5}
              value={tubeWarmth}
              onChange={(e) => setTubeWarmth(Number(e.target.value))}
              className="w-full h-1.5 accent-amber-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-white/40 font-mono">
              <span>0 dB (Clean Transistor)</span>
              <span>3.5 dB (Subtle Tube Glow)</span>
              <span>7.0 dB (Warm Vintage Tape)</span>
              <span>10 dB (Rich Triode Crunch)</span>
            </div>
          </div>

          {/* Virtual Acoustic Spatial Room Reverb */}
          <div className="pt-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Waves className="w-4 h-4 text-indigo-400" />
                <div>
                  <h4 className="text-sm font-semibold text-white">Virtual Acoustic Spatial Room Reverb</h4>
                  <p className="text-xs text-white/50 mt-0.5">
                    Binaural impulse convolution modeling distinct acoustic architectural environments.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { id: 'off', label: 'Off', desc: 'Direct Headphone' },
                { id: 'studio', label: 'Studio', desc: 'Treated Room' },
                { id: 'concert', label: 'Arena', desc: 'Concert Hall' },
                { id: 'cathedral', label: 'Cathedral', desc: 'Gothic Reverb' },
                { id: 'lounge', label: 'Jazz Club', desc: 'Warm Velvet' }
              ].map((rm) => {
                const isSelected = (spatialRoom || 'off') === rm.id;
                return (
                  <button
                    key={rm.id}
                    onClick={() => setSpatialRoom(rm.id as SpatialRoom)}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'bg-indigo-500/20 border-indigo-400/50 text-white shadow-lg ring-1 ring-indigo-400/30'
                        : 'bg-white/[0.02] border-white/5 text-white/60 hover:text-white'
                    }`}
                  >
                    <div className="text-xs font-bold text-white">{rm.label}</div>
                    <div className="text-[10px] text-white/40 mt-0.5">{rm.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* SECTION 2: AI RECOMMENDATIONS & CULTURAL SEPARATION ENGINE     */}
      {/* ============================================================== */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              AI Recommendation & Cultural Discovery Engine
            </h2>
          </div>
          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-pink-500/20 text-pink-300 font-bold border border-pink-500/30">
            Aura AI v2.5
          </span>
        </div>

        <div className="glass-sheet rounded-[24px] p-5 sm:p-6 divide-y divide-white/[0.06] space-y-5 shadow-2xl">
          {/* Recommendation Mode */}
          <div className="space-y-2.5">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-white/45 block">
                Cultural Clustering & Separation Algorithm
              </label>
              <p className="text-xs text-white/45 mt-0.5">
                Controls how strictly algorithmic recommendations honor cultural, linguistic, and regional music universes.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {recommendationModes.map(mode => {
                const isSelected = (settings.recommendationMode || 'strict-cultural') === mode.id;
                return (
                  <div
                    key={mode.id}
                    onClick={() => updateSettings({ recommendationMode: mode.id })}
                    className={`cursor-pointer p-3.5 rounded-2xl border transition-all ${
                      isSelected
                        ? 'bg-pink-950/30 border-pink-500/40 ring-1 ring-pink-500/30 shadow-md'
                        : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{mode.label}</span>
                        {mode.badge && (
                          <span className="text-[10px] px-2 py-0.2 rounded-full bg-pink-500/20 text-pink-300 font-bold border border-pink-500/30">
                            {mode.badge}
                          </span>
                        )}
                      </div>
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center border ${
                        isSelected ? 'bg-pink-500 border-pink-500 text-white' : 'border-white/20 text-transparent'
                      }`}>
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    </div>
                    <p className="text-[11px] text-white/50 mt-1 leading-relaxed">{mode.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cultural Universe Preference */}
          <div className="pt-5 space-y-2.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-white/45 block">
              Default Cultural Listening Preference
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {culturalPreferences.map(pref => {
                const isSelected = (settings.culturalPreference || 'auto') === pref.id;
                return (
                  <div
                    key={pref.id}
                    onClick={() => updateSettings({ culturalPreference: pref.id })}
                    className={`cursor-pointer p-3 rounded-2xl border transition-all ${
                      isSelected
                        ? 'bg-white/10 border-white/30 text-white shadow-md'
                        : 'bg-white/[0.02] border-white/5 text-white/60 hover:text-white'
                    }`}
                  >
                    <div className="text-xs font-bold text-white">{pref.label}</div>
                    <div className="text-[10px] text-white/40 mt-0.5 leading-snug">{pref.desc}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Smart Autoplay Continuity */}
          <div className="pt-5 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-pink-400" />
                <h4 className="text-sm font-semibold text-white">Endless Smart Cultural Autoplay</h4>
              </div>
              <p className="text-xs text-white/50 mt-0.5 max-w-md">
                When your selected album or song completes, Aura AI seamlessly queues the next track from the exact same culture, artist orbit, and tempo.
              </p>
            </div>
            <button
              onClick={() => updateSettings({ smartAutoplay: settings.smartAutoplay !== false ? false : true })}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 shrink-0 ${
                settings.smartAutoplay !== false ? 'bg-pink-500 shadow-md shadow-pink-500/20' : 'bg-white/20'
              }`}
            >
              <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                settings.smartAutoplay !== false ? 'translate-x-6' : 'translate-x-0'
              }`} />
            </button>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* SECTION 3: VISUAL AESTHETICS & THEMES                          */}
      {/* ============================================================== */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md">
              <Eye className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Visual Aesthetics, Themes & 4K Artwork
            </h2>
          </div>
          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
            Apple Glass
          </span>
        </div>

        <div className="glass-sheet rounded-[24px] p-5 sm:p-6 divide-y divide-white/[0.06] space-y-5 shadow-2xl">
          {/* Theme Accent Color Swatches */}
          <div className="space-y-2.5">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-white/45 block">
                Primary Theme Accent Color
              </label>
              <p className="text-xs text-white/40 mt-0.5">
                Dynamic tracks automatically match album artwork; or choose a custom signature accent.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {themeAccents.map(accent => {
                const isSelected = (settings.themeAccent || 'dynamic') === accent.id;
                return (
                  <button
                    key={accent.id}
                    onClick={() => updateSettings({ themeAccent: accent.id })}
                    className={`p-3 rounded-2xl border flex items-center gap-2.5 transition-all text-left ${
                      isSelected
                        ? 'bg-white/10 border-white/30 ring-1 ring-white/20 shadow-md'
                        : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05]'
                    }`}
                  >
                    <span 
                      className="w-4 h-4 rounded-full flex-shrink-0 shadow-sm"
                      style={{ backgroundColor: accent.color }}
                    />
                    <span className="text-xs font-semibold text-white truncate">
                      {accent.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Background Atmosphere Engine */}
          <div className="pt-5 space-y-2.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-white/45 block">
              Background Atmosphere Canvas
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {backgroundStyles.map(bg => {
                const isSelected = (settings.backgroundStyle || 'mesh-fluid') === bg.id;
                return (
                  <div
                    key={bg.id}
                    onClick={() => updateSettings({ backgroundStyle: bg.id })}
                    className={`cursor-pointer p-3.5 rounded-2xl border transition-all ${
                      isSelected
                        ? 'bg-white/10 border-white/30 text-white shadow-md'
                        : 'bg-white/[0.02] border-white/5 text-white/60 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{bg.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#fa2d48]" />}
                    </div>
                    <p className="text-[11px] text-white/45 mt-1">{bg.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Playback Line Shimmer / Pulse Animation */}
          <div className="pt-5 space-y-2.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-white/45 block">
              Playback Music Line Animation Style
            </label>
            <div className="grid grid-cols-3 gap-2">
              {lineAnimationStyles.map(anim => {
                const isSelected = (settings.playbackBarAnimation || 'shimmer') === anim.id;
                return (
                  <button
                    key={anim.id}
                    onClick={() => updateSettings({ playbackBarAnimation: anim.id })}
                    className={`py-2 px-3 rounded-2xl border text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-white/15 border-white/30 text-white shadow-md'
                        : 'bg-white/[0.02] border-white/5 text-white/60 hover:text-white'
                    }`}
                  >
                    {anim.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Jumping Equalizer Soundbars Style */}
          <div className="pt-5 space-y-2.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-white/45 block">
              Jumping Equalizer Soundbars Style
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {soundbarStyles.map(sb => {
                const isSelected = (settings.soundbarStyle || 'apple-4bars') === sb.id;
                return (
                  <button
                    key={sb.id}
                    onClick={() => updateSettings({ soundbarStyle: sb.id })}
                    className={`py-2 px-3 rounded-2xl border text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-white/15 border-white/30 text-white shadow-md'
                        : 'bg-white/[0.02] border-white/5 text-white/60 hover:text-white'
                    }`}
                  >
                    {sb.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Default Audio Reactive Visualizer Mode */}
          <div className="pt-5 space-y-2.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-white/45 block">
              Default Audio Visualizer Engine
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'wave', label: 'Liquid Wave', desc: 'Apple Music Bezier' },
                { id: 'bars', label: '32-Band Spectrum', desc: 'Peak Hold Caps' },
                { id: 'radial', label: '360° Radial Halo', desc: 'Holographic Arc' },
                { id: 'analog-vu', label: 'McIntosh VU Meter', desc: 'Twin Needle Ballistics' }
              ].map((vis) => {
                const isSelected = (visualizerMode || 'wave') === vis.id;
                return (
                  <button
                    key={vis.id}
                    onClick={() => setVisualizerMode(vis.id as VisualizerMode)}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'bg-white/15 border-white/30 text-white shadow-md'
                        : 'bg-white/[0.02] border-white/5 text-white/60 hover:text-white'
                    }`}
                  >
                    <div className="text-xs font-bold text-white">{vis.label}</div>
                    <div className="text-[10px] text-white/40 mt-0.5">{vis.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time-Synced Live Lyrics Customization */}
          <div className="pt-5 space-y-3">
            <div className="flex items-center gap-2">
              <Mic2 className="w-4 h-4 text-[#fa2d48]" />
              <h4 className="text-sm font-semibold text-white">Time-Synced Live Lyrics Display</h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-white/50 block mb-1.5">Font Size:</span>
                <div className="grid grid-cols-3 gap-1.5">
                  {lyricsSizes.map(size => (
                    <button
                      key={size.id}
                      onClick={() => updateSettings({ lyricsFontSize: size.id })}
                      className={`py-2 px-2.5 rounded-xl border text-xs font-semibold transition-all ${
                        settings.lyricsFontSize === size.id
                          ? 'bg-white/15 border-white/30 text-white shadow-sm'
                          : 'bg-white/[0.02] border-white/5 text-white/60 hover:text-white'
                      }`}
                    >
                      {size.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-xs text-white/50 block mb-1.5">Alignment:</span>
                <div className="grid grid-cols-2 gap-1.5">
                  {lyricsAlignments.map(align => (
                    <button
                      key={align.id}
                      onClick={() => updateSettings({ lyricsAlignment: align.id })}
                      className={`py-2 px-2.5 rounded-xl border text-xs font-semibold transition-all ${
                        (settings.lyricsAlignment || 'center') === align.id
                          ? 'bg-white/15 border-white/30 text-white shadow-sm'
                          : 'bg-white/[0.02] border-white/5 text-white/60 hover:text-white'
                      }`}
                    >
                      {align.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div>
                <h5 className="text-xs font-semibold text-white">Cinematic Karaoke Focus Blur</h5>
                <p className="text-[11px] text-white/45 mt-0.5">
                  Subtly blurs non-active lyrics lines to draw complete visual focus to the singing verse.
                </p>
              </div>
              <button
                onClick={() => updateSettings({ lyricsBlurInactive: !settings.lyricsBlurInactive })}
                className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                  settings.lyricsBlurInactive ? 'bg-[#fa2d48]' : 'bg-white/20'
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  settings.lyricsBlurInactive ? 'translate-x-6' : 'translate-x-0'
                }`} />
              </button>
            </div>
          </div>

          {/* 4K Ultra-HD Album Artwork Upscaler */}
          <div className="pt-5 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h4 className="text-sm font-semibold text-white">4K Ultra-HD Uncropped Artwork Engine</h4>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                  UHD 2160p
                </span>
              </div>
              <p className="text-xs text-white/50 mt-0.5">
                Renders maximum-resolution 4K covers uncropped with layered ambient background lighting.
              </p>
            </div>
            <button
              onClick={() => updateSettings({ upscale4kArtwork: !settings.upscale4kArtwork })}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                settings.upscale4kArtwork ? 'bg-amber-500' : 'bg-white/20'
              }`}
            >
              <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                settings.upscale4kArtwork ? 'translate-x-6' : 'translate-x-0'
              }`} />
            </button>
          </div>

          {/* Tactile Haptic Touch Engine */}
          <div className="pt-5 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <h4 className="text-sm font-semibold text-white">Mobile Tactile Haptic Feedback</h4>
              </div>
              <p className="text-xs text-white/50 mt-0.5">
                Subtle vibration impulses on play, pause, song changes, liking songs, and slider scrubs on mobile devices.
              </p>
            </div>
            <button
              onClick={() => updateSettings({ hapticFeedback: !settings.hapticFeedback })}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                settings.hapticFeedback ? 'bg-emerald-500' : 'bg-white/20'
              }`}
            >
              <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                settings.hapticFeedback ? 'translate-x-6' : 'translate-x-0'
              }`} />
            </button>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* SECTION 4: BUFFERING & REGIONAL DISCOVERY                      */}
      {/* ============================================================== */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-md">
              <Zap className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Buffering, Bitrate & Regional Discovery
            </h2>
          </div>
        </div>

        <div className="glass-sheet rounded-[24px] p-5 sm:p-6 divide-y divide-white/[0.06] space-y-5 shadow-2xl">
          {/* Audio Buffer Preload */}
          <div className="space-y-2.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-white/45 block">
              Audio Pre-Cache & Buffering Engine
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {bufferModes.map(b => {
                const isSelected = (settings.bufferPreload || 'balanced') === b.id;
                return (
                  <div
                    key={b.id}
                    onClick={() => updateSettings({ bufferPreload: b.id })}
                    className={`cursor-pointer p-3 rounded-2xl border transition-all ${
                      isSelected
                        ? 'bg-sky-500/10 border-sky-500/40 text-white shadow-md'
                        : 'bg-white/[0.02] border-white/5 text-white/60 hover:text-white'
                    }`}
                  >
                    <div className="text-xs font-bold text-white">{b.label}</div>
                    <p className="text-[11px] text-white/45 mt-1">{b.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Regional Content Selector */}
          <div className="pt-5 space-y-2.5">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-sky-400" />
              <label className="text-[11px] font-bold uppercase tracking-wider text-white/45">
                Trending Music & Search Country / Region
              </label>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              {contentRegions.map(reg => {
                const isSelected = (settings.contentRegion || 'GLOBAL') === reg.id;
                return (
                  <button
                    key={reg.id}
                    onClick={() => updateSettings({ contentRegion: reg.id })}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
                      isSelected
                        ? 'bg-sky-500/20 border-sky-400/40 text-white font-bold shadow-md'
                        : 'bg-white/[0.02] border-white/5 text-white/60 hover:text-white'
                    }`}
                  >
                    <span className="text-base">{reg.flag}</span>
                    <span className="truncate">{reg.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Streaming Bitrate Quality */}
          <div className="pt-5 space-y-2.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-white/45 block">
              Streaming Bitrate Profile
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {bitrateProfiles.map(bitrate => {
                const isSelected = (settings.streamingBitrate || 'lossless-alac') === bitrate.id;
                return (
                  <button
                    key={bitrate.id}
                    onClick={() => updateSettings({ streamingBitrate: bitrate.id })}
                    className={`py-2 px-2.5 rounded-xl border text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-white/15 border-white/30 text-white font-bold shadow-sm'
                        : 'bg-white/[0.02] border-white/5 text-white/60 hover:text-white'
                    }`}
                  >
                    {bitrate.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* SECTION 5: PLAYBACK TEMPO & SLEEP TIMER                        */}
      {/* ============================================================== */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-md">
              <Moon className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Tempo, Pitch & Sleep Timer
            </h2>
          </div>
        </div>

        <div className="glass-sheet rounded-[24px] p-5 sm:p-6 divide-y divide-white/[0.06] space-y-5 shadow-2xl">
          {/* Sleep Timer */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-white">Sleep Timer</h4>
                <p className="text-xs text-white/50 mt-0.5">
                  Fades out volume smoothly before putting playback to sleep.
                </p>
              </div>
              {sleepTimerMinutes !== null && (
                <span className="text-xs font-mono text-amber-300 font-bold bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                  Active ({sleepTimerMinutes}m)
                </span>
              )}
            </div>

            <div className="grid grid-cols-5 gap-2">
              {[
                { label: 'Off', val: null },
                { label: '15m', val: 15 },
                { label: '30m', val: 30 },
                { label: '45m', val: 45 },
                { label: '60m', val: 60 },
              ].map(opt => (
                <button
                  key={opt.label}
                  onClick={() => setSleepTimer(opt.val)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                    sleepTimerMinutes === opt.val
                      ? 'bg-amber-500 text-black border-amber-500 shadow-md font-bold'
                      : 'bg-white/[0.02] border-white/5 text-white/60 hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Speed Pitch */}
          <div className="pt-5 space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <Gauge className="w-4 h-4 text-sky-400" />
                  <h4 className="text-sm font-semibold text-white">Playback Speed / Pitch (Tempo)</h4>
                </div>
                <p className="text-xs text-white/50 mt-0.5">
                  Listen to tracks in slowed + reverb (0.85x) or Nightcore sped-up (1.25x / 1.5x).
                </p>
              </div>
              <span className="text-xs font-mono text-sky-400 font-bold bg-sky-500/20 px-2 py-0.5 rounded-full">
                {playbackSpeed}x
              </span>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
              {[0.75, 0.85, 1.0, 1.15, 1.25, 1.5, 2.0].map(speed => (
                <button
                  key={speed}
                  onClick={() => setPlaybackSpeed(speed)}
                  className={`py-2 px-2 rounded-xl text-xs font-semibold border transition-all ${
                    playbackSpeed === speed
                      ? 'bg-sky-500 text-white border-sky-500 font-bold shadow-md'
                      : 'bg-white/[0.02] border-white/5 text-white/60 hover:text-white'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* SECTION 6: LIBRARY STORAGE, BACKUP & RESTORE                   */}
      {/* ============================================================== */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md">
              <Trash2 className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Library Storage, Backup & Export
            </h2>
          </div>
        </div>

        <div className="glass-sheet rounded-[24px] p-5 sm:p-6 divide-y divide-white/[0.06] space-y-5 shadow-2xl">
          {/* Storage Footprint Overview */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-white/[0.02] border border-white/5 rounded-2xl text-center">
              <span className="text-xl font-black text-white">{favorites.length}</span>
              <p className="text-[11px] text-white/50 mt-0.5">Favorite Tracks</p>
            </div>
            <div className="p-3 bg-white/[0.02] border border-white/5 rounded-2xl text-center">
              <span className="text-xl font-black text-white">{playlists.filter(p => p.isCustom).length}</span>
              <p className="text-[11px] text-white/50 mt-0.5">Custom Playlists</p>
            </div>
            <div className="p-3 bg-white/[0.02] border border-white/5 rounded-2xl text-center">
              <span className="text-xl font-black text-white">Lossless</span>
              <p className="text-[11px] text-white/50 mt-0.5">Audio Engine</p>
            </div>
          </div>

          {/* Backup & Restore Controls */}
          <div className="pt-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-semibold text-white">Library Backup & Migration</h4>
              <p className="text-xs text-white/50 mt-0.5">
                Export all custom playlists, favorites, and audiophile presets to a JSON file or restore on any device.
              </p>
              {importStatus && (
                <p className="text-xs font-semibold text-emerald-400 mt-1">{importStatus}</p>
              )}
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center">
              <button
                onClick={handleExportBackup}
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white flex items-center gap-2 transition-colors shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export JSON</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white flex items-center gap-2 transition-colors shadow-sm"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Import JSON</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImportFile}
                className="hidden"
              />
            </div>
          </div>

          {/* Clear Cache */}
          <div className="pt-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-semibold text-white">Clear Audio Cache & Reset</h4>
              <p className="text-xs text-white/50 mt-0.5">
                Clear cached streaming buffers, search history, and reset to defaults.
              </p>
            </div>

            <button
              onClick={handleClearCache}
              className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-xs font-semibold text-red-300 transition-colors shadow-sm"
            >
              Clear Cache
            </button>
          </div>
        </div>
      </section>

      {/* App Info Footer */}
      <div className="text-center text-xs text-white/30 pt-4 space-y-1">
        <p className="font-semibold text-white/40">Aura Pro Audiophile Studio • Version 2.5.0</p>
        <p>Engineered with Apple Music aesthetics, Poweramp DSP, AutoEQ headphone database & LRCLIB synced lyrics</p>
      </div>
    </div>
  );
};
