import React, { useRef, useEffect, useState } from 'react';
import { formatTime, formatRemainingTime } from '../utils/formatTime';
import { triggerHaptic } from '../utils/haptics';

interface WatchDialScrubberProps {
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  primaryColor?: string;
}

/**
 * Watchmaker Arc Dial Scrubber
 * Adapted from AETHER by GHOSTxASR (GPL-3.0)
 * Precision horological instrument arc with 120 graduation ticks, signal red needle, and rotational touch tracking.
 */
export const WatchDialScrubber: React.FC<WatchDialScrubberProps> = ({
  currentTime,
  duration,
  onSeek,
  primaryColor = '#ff3b30'
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isHeld, setIsHeld] = useState(false);
  const isHeldRef = useRef(false);
  const [hoverVal, setHoverVal] = useState<number | null>(null);

  const TICKS = 120;
  const SWEEP = (Math.PI * 200) / 180; // 200 degree arc
  const toAngle = (t: number) => -Math.PI / 2 - SWEEP / 2 + SWEEP * t;

  const progress = duration > 0 ? Math.min(1, Math.max(0, currentTime / duration)) : 0;
  const effectiveProgress = hoverVal !== null ? hoverVal : progress;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.round(rect.width * dpr);
    const h = Math.round(rect.height * dpr);
    canvas.width = w;
    canvas.height = h;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, rect.width, rect.height);

    const radius = Math.min(rect.width * 0.44, rect.height * 0.88);
    const pivot = { x: rect.width / 2, y: rect.height - 12 };

    // 1. Draw 120 graduation tick marks
    for (let i = 0; i <= TICKS; i++) {
      const p = i / TICKS;
      const a = toAngle(p);
      const isMajor = i % 10 === 0;
      const isQuarter = i % 30 === 0;
      const isPassed = p <= effectiveProgress;

      const rIn = radius - (isQuarter ? 24 : isMajor ? 16 : 9);
      const rOut = radius;

      ctx.strokeStyle = isPassed 
        ? (isMajor ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.65)')
        : (isMajor ? 'rgba(255,255,255,0.32)' : 'rgba(255,255,255,0.14)');
      ctx.lineWidth = isQuarter ? 2.0 : isMajor ? 1.4 : 0.9;

      ctx.beginPath();
      ctx.moveTo(pivot.x + Math.cos(a) * rIn, pivot.y + Math.sin(a) * rIn);
      ctx.lineTo(pivot.x + Math.cos(a) * rOut, pivot.y + Math.sin(a) * rOut);
      ctx.stroke();
    }

    // 2. Outer hairline circular bezel
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(pivot.x, pivot.y, radius + 12, toAngle(0) - 0.02, toAngle(1) + 0.02);
    ctx.stroke();

    // 3. Signal Red Needle (#ff3b30)
    const curA = toAngle(effectiveProgress);
    const needleFoot = {
      x: pivot.x + Math.cos(curA) * radius * 0.46,
      y: pivot.y + Math.sin(curA) * radius * 0.46
    };
    const needleTip = {
      x: pivot.x + Math.cos(curA) * (radius + 8),
      y: pivot.y + Math.sin(curA) * (radius + 8)
    };

    // Needle glow if active
    if (isHeld) {
      ctx.shadowColor = '#ff3b30';
      ctx.shadowBlur = 12;
    } else {
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
    }

    ctx.strokeStyle = '#ff3b30';
    ctx.lineWidth = isHeld ? 2.8 : 2.0;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(needleFoot.x, needleFoot.y);
    ctx.lineTo(needleTip.x, needleTip.y);
    ctx.stroke();

    // Needle pivot head
    ctx.fillStyle = '#ff3b30';
    ctx.beginPath();
    ctx.arc(needleFoot.x, needleFoot.y, 3.6, 0, Math.PI * 2);
    ctx.fill();

    // Center pivot anchor
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.beginPath();
    ctx.arc(pivot.x, pivot.y, 4, 0, Math.PI * 2);
    ctx.fill();
  }, [effectiveProgress, isHeld, primaryColor]);

  const handlePointerCalc = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || duration <= 0) return;
    const rect = canvas.getBoundingClientRect();
    const pivot = { x: rect.width / 2, y: rect.height - 12 };

    const x = e.clientX - rect.left - pivot.x;
    const y = e.clientY - rect.top - pivot.y;

    let a = Math.atan2(y, x) + Math.PI / 2;
    if (a > Math.PI) a -= 2 * Math.PI;

    const norm = Math.max(0, Math.min(1, (a + SWEEP / 2) / SWEEP));
    setHoverVal(norm);
    triggerHaptic('tick');
    onSeek(norm * duration);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isHeldRef.current = true;
    setIsHeld(true);
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
    handlePointerCalc(e);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isHeldRef.current) return;
    handlePointerCalc(e);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isHeldRef.current) {
      isHeldRef.current = false;
      setIsHeld(false);
      setHoverVal(null);
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {}
    }
  };

  const displayTime = hoverVal !== null ? hoverVal * duration : currentTime;

  return (
    <div className="w-full flex flex-col items-center select-none pt-2">
      {/* 1. Canvas Dial Arc */}
      <div className="relative w-full max-w-sm h-36 sm:h-44 flex items-center justify-center">
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="w-full h-full cursor-grab active:cursor-grabbing touch-none"
        />

        {/* Dial Center Status Indicator */}
        <div className="absolute bottom-1 flex flex-col items-center pointer-events-none text-center">
          <div className="font-mono tabular-nums text-2xl sm:text-3xl font-semibold text-white tracking-tight">
            {formatTime(displayTime)}
          </div>
          <div className="font-caps text-[9px] tracking-[0.24em] text-white/45 mt-0.5">
            REMAINING {formatRemainingTime(displayTime, duration)}
          </div>
        </div>
      </div>
    </div>
  );
};
