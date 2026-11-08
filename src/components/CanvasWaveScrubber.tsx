import React, { useEffect, useRef } from 'react';

interface CanvasWaveScrubberProps {
  isPlaying: boolean;
  percentPlayed: number;
  primaryColor: string;
  isHovered: boolean;
  isScrubbing: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  life: number;
}

export const CanvasWaveScrubber: React.FC<CanvasWaveScrubberProps> = ({
  isPlaying,
  percentPlayed,
  primaryColor,
  isHovered,
  isScrubbing,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;

    const render = () => {
      time += 0.04;
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      const headX = (percentPlayed / 100) * width;
      const centerY = height / 2;

      // 1. Draw subtle fluid sine wave across the played progress
      if (isPlaying && headX > 8) {
        ctx.beginPath();
        const waveLength = headX;
        const step = 3;
        for (let x = 0; x <= waveLength; x += step) {
          const progressRatio = x / waveLength;
          // Amplitude increases toward the playhead
          const amp = Math.sin(progressRatio * Math.PI) * (isHovered ? 4.5 : 2.5);
          const y = centerY + Math.sin(x * 0.08 + time * 3) * amp;

          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        const waveGrad = ctx.createLinearGradient(0, 0, headX, 0);
        waveGrad.addColorStop(0, `${primaryColor}00`);
        waveGrad.addColorStop(0.5, `${primaryColor}bb`);
        waveGrad.addColorStop(1, '#ffffff');

        ctx.strokeStyle = waveGrad;
        ctx.lineWidth = isHovered ? 2.5 : 1.5;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Second subtle counter-wave for rich fluidity
        ctx.beginPath();
        for (let x = 0; x <= waveLength; x += step) {
          const progressRatio = x / waveLength;
          const amp = Math.sin(progressRatio * Math.PI) * (isHovered ? 3.0 : 1.8);
          const y = centerY + Math.cos(x * 0.12 - time * 2.5) * amp;

          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `${primaryColor}66`;
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }

      // 2. Playhead Dynamic Sparkle Particles (active when playing or scrubbing)
      if ((isPlaying || isScrubbing || isHovered) && Math.random() < 0.45) {
        if (particlesRef.current.length < 24) {
          particlesRef.current.push({
            x: headX + (Math.random() - 0.5) * 6,
            y: centerY + (Math.random() - 0.5) * 4,
            vx: (Math.random() - 0.5) * 1.2,
            vy: (Math.random() - 0.7) * 1.5,
            size: Math.random() * 2 + 1,
            alpha: 1,
            life: Math.random() * 25 + 20,
          });
        }
      }

      // Update and draw particles
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 1 / p.life;

        if (p.alpha <= 0) {
          particlesRef.current.splice(i, 1);
          continue;
        }

        ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha * 0.85})`;
        ctx.shadowColor = primaryColor;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, percentPlayed, primaryColor, isHovered, isScrubbing]);

  // Handle high-DPI canvas resizing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const updateSize = () => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        canvas.width = rect.width * (window.devicePixelRatio || 1);
        canvas.height = rect.height * (window.devicePixelRatio || 1);
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-10"
      style={{ overflow: 'visible' }}
    />
  );
};
