import React, { useEffect, useRef, useState } from 'react';

interface Figure {
  id: string;
  name: string;
  subtitle: string;
}

const FIGURES: Figure[] = [
  { id: 'statue', name: 'The Listener', subtitle: 'Sculpted for Aura, MMXXVI' },
  { id: 'zeus', name: 'Zeus', subtitle: 'Bronze from Cape Artemision, c. 460 BC' },
  { id: 'hera', name: 'Hera', subtitle: 'The Barberini type' },
  { id: 'apollo', name: 'Apollo', subtitle: 'The Belvedere, after Leochares' },
  { id: 'nike', name: 'Nike', subtitle: 'Winged Victory of Samothrace, c. 190 BC' },
  { id: 'smyrna', name: 'Zeus of Smyrna', subtitle: 'From Smyrna, the Louvre' },
  { id: 'artemis', name: 'Artemis', subtitle: 'Versailles, after Leochares' },
  { id: 'poseidon', name: 'Poseidon', subtitle: 'Parian marble from Melos' },
  { id: 'athena', name: 'Athena', subtitle: 'The Giustiniani, the Vatican' },
  { id: 'hermes', name: 'Hermes', subtitle: 'Olympia, with infant Dionysus' },
  { id: 'aphrodite', name: 'Aphrodite', subtitle: 'Venus de Milo, c. 100 BC' },
  { id: 'dionysus', name: 'Dionysus', subtitle: 'The Richelieu, the Louvre' }
];

const NUMERALS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];

/**
 * Halftone Antiquity Statues Hero
 * Adapted from AETHER by GHOSTxASR (GPL-3.0)
 * 12 Classical statues rendered as flying halftone lattice dots morphing across antiquity.
 */
export const HalftoneHero: React.FC<{ onExploreClick?: () => void }> = ({ onExploreClick: _onExploreClick }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const currentIdxRef = useRef<number>(0);
  const [dotCount, setDotCount] = useState<number>(14200);

  // Cached image pixel data
  const toneDataCache = useRef<Map<string, Float32Array>>(new Map());
  const pointsRef = useRef<{
    x: Float32Array;
    y: Float32Array;
    curX: Float32Array;
    curY: Float32Array;
    targetRadius: Float32Array;
    curRadius: Float32Array;
    n: number;
  }>({
    x: new Float32Array(0),
    y: new Float32Array(0),
    curX: new Float32Array(0),
    curY: new Float32Array(0),
    targetRadius: new Float32Array(0),
    curRadius: new Float32Array(0),
    n: 0
  });

  const nextFigure = () => {
    const next = (currentIdxRef.current + 1) % FIGURES.length;
    currentIdxRef.current = next;
    setCurrentIdx(next);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let isMounted = true;

    // Load an image into memory canvas and extract luminance
    const loadTones = async (fig: Figure, w: number, h: number): Promise<Float32Array> => {
      if (toneDataCache.current.has(fig.id)) {
        return toneDataCache.current.get(fig.id)!;
      }
      return new Promise<Float32Array>((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = `/statues/${fig.id}.jpg`;
        img.onload = () => {
          const off = document.createElement('canvas');
          off.width = w;
          off.height = h;
          const offCtx = off.getContext('2d');
          if (!offCtx) {
            resolve(new Float32Array(w * h));
            return;
          }
          offCtx.drawImage(img, 0, 0, w, h);
          const imgData = offCtx.getImageData(0, 0, w, h).data;
          const tones = new Float32Array(w * h);
          for (let i = 0; i < tones.length; i++) {
            const r = imgData[i * 4];
            const g = imgData[i * 4 + 1];
            const b = imgData[i * 4 + 2];
            // Perceived luminance
            tones[i] = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
          }
          toneDataCache.current.set(fig.id, tones);
          resolve(tones);
        };
        img.onerror = () => {
          const empty = new Float32Array(w * h).fill(0.3);
          toneDataCache.current.set(fig.id, empty);
          resolve(empty);
        };
      });
    };

    const setupLattice = async () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.floor(rect.width * dpr);
      const h = Math.floor(rect.height * dpr);
      canvas.width = w;
      canvas.height = h;

      const pitch = Math.max(4.5 * dpr, Math.min(w, h) / 75);
      const cols = Math.floor(w / pitch);
      const rows = Math.floor(h / pitch);
      const count = cols * rows;

      const xs = new Float32Array(count);
      const ys = new Float32Array(count);
      const curX = new Float32Array(count);
      const curY = new Float32Array(count);
      const targetR = new Float32Array(count);
      const curR = new Float32Array(count);

      let idx = 0;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = (c + 0.5) * pitch;
          const y = (r + 0.5) * pitch;
          xs[idx] = x;
          ys[idx] = y;
          curX[idx] = x + (Math.random() - 0.5) * 40 * dpr;
          curY[idx] = y + (Math.random() - 0.5) * 40 * dpr;
          idx++;
        }
      }

      pointsRef.current = {
        x: xs,
        y: ys,
        curX: curX,
        curY: curY,
        targetRadius: targetR,
        curRadius: curR,
        n: count
      };

      setDotCount(count);
      updateFigureTones(currentIdxRef.current, cols, rows);
    };

    const updateFigureTones = async (figIdx: number, cols: number, rows: number) => {
      const tones = await loadTones(FIGURES[figIdx], cols, rows);
      if (!isMounted) return;
      const pts = pointsRef.current;
      for (let i = 0; i < pts.n; i++) {
        const lum = tones[i] || 0;
        // Contrast curve: dark background, bright highlights
        const val = Math.max(0, Math.min(1, (lum - 0.18) * 1.35));
        pts.targetRadius[i] = val * 2.8;
      }
    };

    setupLattice();

    let lastTime = performance.now();
    let cycleTimer = 0;

    const render = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;

      // Auto cycle every 9 seconds as designed in AETHER
      cycleTimer += dt;
      if (cycleTimer >= 9.0) {
        cycleTimer = 0;
        nextFigure();
      }

      const pts = pointsRef.current;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#ffffff';

      const spring = 0.08;
      for (let i = 0; i < pts.n; i++) {
        // Move towards grid anchor
        pts.curX[i] += (pts.x[i] - pts.curX[i]) * spring;
        pts.curY[i] += (pts.y[i] - pts.curY[i]) * spring;
        // Interpolate radius
        pts.curRadius[i] += (pts.targetRadius[i] - pts.curRadius[i]) * 0.12;

        const r = pts.curRadius[i];
        if (r > 0.4) {
          ctx.beginPath();
          ctx.arc(pts.curX[i], pts.curY[i], r * dpr, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    const handleResize = () => {
      setupLattice();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      isMounted = false;
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Update target dots whenever figure index changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.floor(rect.width * dpr);
    const h = Math.floor(rect.height * dpr);
    const pitch = Math.max(4.5 * dpr, Math.min(w, h) / 75);
    const cols = Math.floor(w / pitch);
    const rows = Math.floor(h / pitch);

    const pts = pointsRef.current;
    // Jolt dots slightly upwards so the face lands last, exactly as in AETHER
    for (let i = 0; i < pts.n; i++) {
      pts.curY[i] += (Math.random() * 25 + 10) * dpr;
      pts.curX[i] += (Math.random() - 0.5) * 15 * dpr;
    }

    const loadAsync = async () => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = `/statues/${FIGURES[currentIdx].id}.jpg`;
      img.onload = () => {
        const off = document.createElement('canvas');
        off.width = cols;
        off.height = rows;
        const offCtx = off.getContext('2d');
        if (!offCtx) return;
        offCtx.drawImage(img, 0, 0, cols, rows);
        const data = offCtx.getImageData(0, 0, cols, rows).data;
        for (let i = 0; i < pts.n; i++) {
          const lum = (data[i * 4] * 0.299 + data[i * 4 + 1] * 0.587 + data[i * 4 + 2] * 0.114) / 255;
          const val = Math.max(0, Math.min(1, (lum - 0.18) * 1.35));
          pts.targetRadius[i] = val * 2.8;
        }
      };
    };
    loadAsync();
  }, [currentIdx]);

  const figure = FIGURES[currentIdx];

  return (
    <section className="relative w-full rounded-[32px] overflow-hidden bg-black border border-white/10 select-none shadow-2xl">
      {/* 1. Halftone Dot Canvas */}
      <div 
        className="relative w-full h-[360px] sm:h-[460px] cursor-pointer overflow-hidden flex items-center justify-center"
        onClick={nextFigure}
        title="Tap to morph into the next antiquity deity"
      >
        <canvas 
          ref={canvasRef} 
          className="w-full h-full object-cover block opacity-90"
        />

        {/* Ambient Vignette Overlay */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 85%, #000000 100%)'
          }}
        />

        {/* Bottom Editorial Title Bar */}
        <div className="absolute inset-x-0 bottom-6 px-6 sm:px-10 flex items-end justify-between pointer-events-none z-10">
          <div>
            <span className="font-caps text-[10px] tracking-[0.34em] text-white/50 block mb-1">
              ANTIQVITAS • {NUMERALS[currentIdx]}
            </span>
            <h1 className="font-script text-5xl sm:text-7xl text-white font-normal leading-none drop-shadow-2xl">
              Listen
            </h1>
            <p className="font-serif-editorial italic text-sm sm:text-base text-white/80 mt-1">
              {figure.name}
            </p>
          </div>

          {/* Right Museum Inscription */}
          <div className="text-right max-w-[200px] sm:max-w-xs hidden xs:block">
            <span className="font-serif-editorial text-xs text-white/50 block line-clamp-2">
              {figure.subtitle}
            </span>
            <span className="font-caps text-[9px] tracking-[0.24em] text-white/40 block mt-1">
              {dotCount.toLocaleString()} DOTS • 9S CYCLE
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
