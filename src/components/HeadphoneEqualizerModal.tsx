import React, { useEffect, useRef, useState } from 'react';
import { useAudio } from '../context/AudioContext';
import { X, Headphones, Check } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

export interface HeadphoneModel {
  b: string; // Brand (e.g. Apple)
  n: string; // Name (e.g. AirPods Max)
  by: string; // Measured by (e.g. oratory1990)
  f: Array<[string, number, number, number]>; // [type, hz, gain, q]
}

/**
 * Headphone Equalizer & Acoustic Measurement Bench
 * Adapted from AETHER by GHOSTxASR (GPL-3.0) & AutoEq by Jaakko Pasanen
 * Interactive 20Hz-20kHz frequency response curve visualizer and parametric biquad equalizer.
 */
export const HeadphoneEqualizerModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const { setEqBandGain } = useAudio();
  const [headphones, setHeadphones] = useState<HeadphoneModel[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const [activeModel, setActiveModel] = useState<HeadphoneModel | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Load AutoEq database from public/media/headphones.json
  useEffect(() => {
    fetch('/media/headphones.json')
      .then(res => res.json())
      .then((data: HeadphoneModel[]) => {
        if (Array.isArray(data)) {
          setHeadphones(data);
          // Check localStorage for previously active headphone
          const saved = localStorage.getItem('aura_active_headphone');
          if (saved) {
            try {
              const parsed = JSON.parse(saved);
              const foundIdx = data.findIndex(h => h.b === parsed.b && h.n === parsed.n);
              if (foundIdx >= 0) {
                setSelectedIdx(foundIdx);
                setActiveModel(data[foundIdx]);
              }
            } catch {}
          }
        }
      })
      .catch(err => console.warn('[HeadphoneEQ] Failed to load headphones.json:', err));
  }, []);

  // Filter mathematics from AETHER: biquad transfer functions
  const calculateCurve = (filters: Array<[string, number, number, number]>, points = 180): Float32Array => {
    const fs = 48000;
    const coefficients = ([type, hz, gain, q]: [string, number, number, number]) => {
      const w = (2 * Math.PI * hz) / fs;
      const c = Math.cos(w);
      const alpha = Math.sin(w) / (2 * q);
      const a = Math.pow(10, gain / 40);
      const s = 2 * Math.sqrt(a) * alpha;

      let b0 = 1, b1 = 0, b2 = 0, a0 = 1, a1 = 0, a2 = 0;

      if (type === 'PK') {
        b0 = 1 + alpha * a;
        b1 = -2 * c;
        b2 = 1 - alpha * a;
        a0 = 1 + alpha / a;
        a1 = -2 * c;
        a2 = 1 - alpha / a;
      } else if (type === 'LSC') {
        b0 = a * (a + 1 - (a - 1) * c + s);
        b1 = 2 * a * (a - 1 - (a + 1) * c);
        b2 = a * (a + 1 - (a - 1) * c - s);
        a0 = a + 1 + (a - 1) * c + s;
        a1 = -2 * (a - 1 + (a + 1) * c);
        a2 = a + 1 + (a - 1) * c - s;
      } else {
        // HSC
        b0 = a * (a + 1 + (a - 1) * c + s);
        b1 = -2 * a * (a - 1 + (a + 1) * c);
        b2 = a * (a + 1 + (a - 1) * c - s);
        a0 = a + 1 - (a - 1) * c + s;
        a1 = 2 * (a - 1 - (a + 1) * c);
        a2 = a + 1 - (a - 1) * c - s;
      }

      return [b0 / a0, b1 / a0, b2 / a0, a1 / a0, a2 / a0];
    };

    const db = (coeffs: number[], hz: number) => {
      const w = (2 * Math.PI * hz) / fs;
      const cw = Math.cos(w);
      const sw = Math.sin(w);
      const c2 = Math.cos(2 * w);
      const s2 = Math.sin(2 * w);

      const nr = coeffs[0] + coeffs[1] * cw + coeffs[2] * c2;
      const ni = coeffs[1] * sw + coeffs[2] * s2;
      const dr = 1 + coeffs[3] * cw + coeffs[4] * c2;
      const di = coeffs[3] * sw + coeffs[4] * s2;

      return 10 * Math.log10((nr * nr + ni * ni) / (dr * dr + di * di));
    };

    const cs = filters.map(f => coefficients(f));
    const result = new Float32Array(points);
    for (let i = 0; i < points; i++) {
      const hz = 20 * Math.pow(1000, i / (points - 1));
      let sum = 0;
      for (const c of cs) {
        sum += db(c, hz);
      }
      result[i] = sum;
    }
    return result;
  };

  // Render logarithmic curve to canvas
  useEffect(() => {
    if (!isOpen || !canvasRef.current || headphones.length === 0) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, rect.width, rect.height);

    const model = headphones[selectedIdx];
    if (!model) return;

    const points = 180;
    const range = 12; // +/- 12 dB
    const w = rect.width;
    const h = rect.height;
    const mid = h / 2;
    const per = mid / range;

    const curve = calculateCurve(model.f, points);

    // Grid lines for standard frequencies: 50, 100, 500, 1k, 5k, 10k
    const gridFreqs: Array<[number, string]> = [
      [50, '50'],
      [100, '100'],
      [500, '500'],
      [1000, '1k'],
      [5000, '5k'],
      [10000, '10k']
    ];

    ctx.font = '500 9px Montserrat, sans-serif';
    ctx.textAlign = 'center';

    gridFreqs.forEach(([hz, label]) => {
      const x = (Math.log(hz / 20) / Math.log(1000)) * w;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h - 18);
      ctx.stroke();

      ctx.fillStyle = '#6b7280';
      ctx.fillText(label, x, h - 5);
    });

    // Zero dB reference horizontal line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, mid);
    ctx.lineTo(w, mid);
    ctx.stroke();

    // +6dB and -6dB reference lines
    for (const d of [-6, 6]) {
      const y = mid - d * per;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Response Curve Path
    const path = new Path2D();
    for (let i = 0; i < points; i++) {
      const x = (i / (points - 1)) * w;
      const y = mid - Math.max(-range, Math.min(range, curve[i])) * per;
      if (i === 0) path.moveTo(x, y);
      else path.lineTo(x, y);
    }

    // Gradient fill under curve
    const fillPath = new Path2D(path);
    fillPath.lineTo(w, mid);
    fillPath.lineTo(0, mid);
    fillPath.closePath();

    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, 'rgba(255, 59, 48, 0.28)'); // #ff3b30
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.03)');
    gradient.addColorStop(1, 'rgba(255, 59, 48, 0.28)');

    ctx.fillStyle = gradient;
    ctx.fill(fillPath);

    // Curve line stroke
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.0;
    ctx.lineJoin = 'round';
    ctx.stroke(path);
  }, [isOpen, selectedIdx, headphones]);

  const applyCorrection = (model: HeadphoneModel) => {
    setActiveModel(model);
    localStorage.setItem('aura_active_headphone', JSON.stringify({ b: model.b, n: model.n }));

    // Evaluate curve at 5 EQ bands (60Hz, 230Hz, 910Hz, 3600Hz, 14000Hz)
    const curve = calculateCurve(model.f, 180);
    const getDbAt = (targetHz: number) => {
      const norm = Math.log(targetHz / 20) / Math.log(1000);
      const idx = Math.max(0, Math.min(179, Math.round(norm * 179)));
      return Math.max(-12, Math.min(12, curve[idx]));
    };

    const bands = [60, 230, 910, 3600, 14000];
    bands.forEach((hz, idx) => {
      const gain = getDbAt(hz);
      setEqBandGain(idx, Math.round(gain * 10) / 10);
    });

    triggerHaptic('success');
  };

  const removeCorrection = () => {
    setActiveModel(null);
    localStorage.removeItem('aura_active_headphone');
    [0, 1, 2, 3, 4].forEach(idx => setEqBandGain(idx, 0));
    triggerHaptic('medium');
  };

  if (!isOpen) return null;

  const filtered = headphones.filter(h => 
    `${h.b} ${h.n}`.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const current = headphones[selectedIdx];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-2xl animate-fade-in select-none">
      <div 
        className="relative w-full max-w-2xl bg-[#0b0b0f] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
        style={{
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18), 0 24px 64px rgba(0,0,0,0.85)'
        }}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/[0.08] flex items-center justify-center border border-white/15">
              <Headphones className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-caps text-[9.5px] tracking-[0.24em] text-white/50 block">
                AUDIOPHILE ACOUSTICS • AUTOEQ
              </span>
              <h2 className="font-serif-editorial text-xl sm:text-2xl text-white font-normal">
                Headphone Correction Bench
              </h2>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Frequency Response Curve */}
        <div className="p-6 bg-black/40 border-b border-white/10 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-sans font-semibold text-sm sm:text-base text-white">
                {current ? `${current.b} ${current.n}` : 'Select Model'}
              </div>
              <div className="font-serif-editorial italic text-xs text-white/50">
                {current ? `Lab measurement by ${current.by} • Target Harman Curve` : ''}
              </div>
            </div>

            {activeModel && current && activeModel.b === current.b && activeModel.n === current.n ? (
              <button
                onClick={removeCorrection}
                className="px-3.5 py-1.5 rounded-full bg-[#ff3b30]/20 border border-[#ff3b30]/50 text-[#ff3b30] font-caps text-[9px] tracking-[0.16em]"
              >
                DISENGAGE CORRECTION
              </button>
            ) : current ? (
              <button
                onClick={() => applyCorrection(current)}
                className="px-4 py-1.5 rounded-full bg-white text-black font-caps text-[9px] tracking-[0.16em] font-semibold hover:scale-105 active:scale-95 transition-transform"
              >
                APPLY PROFILE
              </button>
            ) : null}
          </div>

          {/* Interactive Response Canvas */}
          <div className="w-full h-36 sm:h-44 rounded-2xl bg-[#050507] border border-white/5 p-2 overflow-hidden">
            <canvas ref={canvasRef} className="w-full h-full block" />
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-6 py-3 border-b border-white/10">
          <input
            type="text"
            placeholder="Search 39 headphone models (AirPods, HD 800 S, Sony, Bose...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder-white/40 text-xs focus:outline-none focus:border-white/30"
          />
        </div>

        {/* Headphone Model Catalog List */}
        <div className="overflow-y-auto flex-1 divide-y divide-white/5 no-scrollbar p-2">
          {filtered.map((item) => {
            const isSelected = headphones[selectedIdx]?.b === item.b && headphones[selectedIdx]?.n === item.n;
            const isCurrentlyActive = activeModel?.b === item.b && activeModel?.n === item.n;

            return (
              <div
                key={`${item.b}-${item.n}`}
                onClick={() => {
                  const idx = headphones.findIndex(h => h.b === item.b && h.n === item.n);
                  if (idx >= 0) setSelectedIdx(idx);
                  triggerHaptic('light');
                }}
                className={`p-3.5 rounded-xl cursor-pointer flex items-center justify-between transition-colors ${
                  isSelected ? 'bg-white/[0.12] text-white' : 'hover:bg-white/[0.04] text-white/70'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${isCurrentlyActive ? 'bg-[#ff3b30] shadow-[0_0_8px_#ff3b30]' : 'bg-transparent'}`} />
                  <div>
                    <div className="font-sans font-medium text-xs sm:text-sm text-white">
                      <span className="text-white/50">{item.b}</span> {item.n}
                    </div>
                    <div className="text-[10px] text-white/40 font-serif-editorial">
                      Profile: {item.by} ({item.f.length} filters)
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isCurrentlyActive && (
                    <span className="font-caps text-[8.5px] tracking-[0.16em] text-[#ff3b30] bg-[#ff3b30]/10 px-2 py-0.5 rounded-full border border-[#ff3b30]/30">
                      ENGAGED
                    </span>
                  )}
                  {isSelected && (
                    <Check className="w-4 h-4 text-white" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Note */}
        <div className="px-6 py-3.5 border-t border-white/10 bg-black/60 flex items-center justify-between text-[10px] text-white/45 font-sans">
          <span>Target: Harman Over-Ear / In-Ear Acoustic Research Target</span>
          <span>Source: AutoEq Jaakko Pasanen (MIT)</span>
        </div>
      </div>
    </div>
  );
};
