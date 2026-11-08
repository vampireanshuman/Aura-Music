import React, { useEffect, useRef } from 'react';
import { useAudio } from '../context/AudioContext';
import type { VisualizerMode } from '../types/music';

interface VisualizerProps {
  className?: string;
  barCount?: number;
  mode?: VisualizerMode;
  showPeakInfo?: boolean;
}

export const AudioVisualizer: React.FC<VisualizerProps> = ({ 
  className = 'w-full h-14', 
  barCount = 32,
  mode = 'wave',
  showPeakInfo: _showPeakInfo = false
}) => {
  const { analyserNode, isPlaying, currentTrack, activeThemeColor } = useAudio();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const peakValuesRef = useRef<number[]>([]);
  const vuLeftRef = useRef<number>(0);
  const vuRightRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let bufferLength = 64;
    let dataArray = new Uint8Array(bufferLength);

    if (analyserNode) {
      bufferLength = analyserNode.frequencyBinCount;
      dataArray = new Uint8Array(bufferLength);
    }

    if (peakValuesRef.current.length !== barCount) {
      peakValuesRef.current = new Array(barCount).fill(0);
    }

    const render = () => {
      animationFrameRef.current = requestAnimationFrame(render);

      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      if (analyserNode && isPlaying) {
        analyserNode.getByteFrequencyData(dataArray);
      } else {
        for (let i = 0; i < dataArray.length; i++) {
          dataArray[i] = Math.max(0, dataArray[i] * 0.92);
        }
      }

      const dominant = activeThemeColor || currentTrack?.dominantColor || '#fa2d48';
      const secondary = currentTrack?.secondaryColor || '#8b5cf6';

      // =====================================================================
      // MODE 1: LIQUID WAVE (Apple Music Fluid Canvas)
      // =====================================================================
      if (mode === 'wave') {
        const points = barCount;
        const sliceWidth = width / (points - 1);

        // Background subtle shadow wave
        ctx.beginPath();
        for (let i = 0; i < points; i++) {
          const dataIndex = Math.floor((i / points) * (dataArray.length * 0.65));
          const v = (dataArray[dataIndex] || (isPlaying ? Math.sin(Date.now() / 250 + i * 0.4) * 20 + 30 : 6)) / 255.0;
          const y = height / 2 + Math.sin(i * 0.35 + Date.now() / 350) * (v * height * 0.45);
          const x = i * sliceWidth;

          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `${secondary}40`;
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Foreground vibrant crest wave
        ctx.beginPath();
        for (let i = 0; i < points; i++) {
          const dataIndex = Math.floor((i / points) * (dataArray.length * 0.75));
          const v = (dataArray[dataIndex] || (isPlaying ? Math.cos(Date.now() / 300 + i * 0.5) * 25 + 35 : 8)) / 255.0;
          const y = height / 2 - Math.sin(i * 0.45 + Date.now() / 280) * (v * height * 0.48);
          const x = i * sliceWidth;

          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        const gradient = ctx.createLinearGradient(0, 0, width, 0);
        gradient.addColorStop(0, dominant);
        gradient.addColorStop(0.5, '#ffffff');
        gradient.addColorStop(1, secondary);

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 3;
        ctx.shadowColor = dominant;
        ctx.shadowBlur = isPlaying ? 12 : 2;
        ctx.stroke();
        ctx.shadowBlur = 0;

      // =====================================================================
      // MODE 2: 32-BAND STUDIO SPECTRUM BARS (Poweramp Studio Style)
      // =====================================================================
      } else if (mode === 'bars') {
        const totalBars = barCount;
        const barWidth = (width / totalBars) * 0.70;
        const gap = (width - totalBars * barWidth) / (totalBars - 1);

        for (let i = 0; i < totalBars; i++) {
          const dataIndex = Math.floor((i / totalBars) * (dataArray.length * 0.75));
          const value = dataArray[dataIndex] || (isPlaying ? Math.sin(Date.now() / 200 + i) * 15 + 20 : 4);
          const percent = value / 255;
          const barHeight = Math.max(percent * (height * 0.88), 3);

          const x = i * (barWidth + gap);
          const y = height - barHeight;

          // Peak decay hold caps
          if (percent > peakValuesRef.current[i]) {
            peakValuesRef.current[i] = percent;
          } else {
            peakValuesRef.current[i] = Math.max(0, peakValuesRef.current[i] - 0.015);
          }
          const peakY = height - Math.max(peakValuesRef.current[i] * (height * 0.88), 3);

          // Bar gradient
          const gradient = ctx.createLinearGradient(0, height, 0, 0);
          gradient.addColorStop(0, `${dominant}dd`);
          gradient.addColorStop(0.7, dominant);
          gradient.addColorStop(1, secondary);

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, barHeight, [3, 3, 1, 1]);
          ctx.fill();

          // Peak cap line
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(x, Math.max(0, peakY - 2), barWidth, 2);

          if (isPlaying && percent > 0.5) {
            ctx.shadowColor = dominant;
            ctx.shadowBlur = 8;
          } else {
            ctx.shadowBlur = 0;
          }
        }

      // =====================================================================
      // MODE 3: 360° RADIAL ORBIT HALO (Iron Man / Holographic Halo)
      // =====================================================================
      } else if (mode === 'radial') {
        const centerX = width / 2;
        const centerY = height / 2;
        const baseRadius = Math.min(centerX, centerY) * 0.55;
        const totalRays = barCount;

        // Inner glowing core
        ctx.beginPath();
        ctx.arc(centerX, centerY, baseRadius * 0.7, 0, Math.PI * 2);
        ctx.fillStyle = `${dominant}15`;
        ctx.fill();

        for (let i = 0; i < totalRays; i++) {
          const angle = (i / totalRays) * Math.PI * 2;
          const dataIndex = Math.floor((i / totalRays) * (dataArray.length * 0.7));
          const v = (dataArray[dataIndex] || (isPlaying ? Math.sin(Date.now() / 200 + i) * 15 + 25 : 6)) / 255.0;
          const rayLength = v * (baseRadius * 0.85);

          const x1 = centerX + Math.cos(angle) * baseRadius;
          const y1 = centerY + Math.sin(angle) * baseRadius;
          const x2 = centerX + Math.cos(angle) * (baseRadius + rayLength);
          const y2 = centerY + Math.sin(angle) * (baseRadius + rayLength);

          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.strokeStyle = i % 2 === 0 ? dominant : secondary;
          ctx.lineWidth = 2.5;
          ctx.stroke();
        }

      // =====================================================================
      // MODE 4: VINTAGE ANALOG MCINTOSH VU METERS (Dual Left / Right)
      // =====================================================================
      } else if (mode === 'analog-vu') {
        // Average low/mid energy for Left and Right needle ballistics
        let sumL = 0;
        let sumR = 0;
        const half = Math.floor(dataArray.length / 2);
        for (let i = 0; i < half; i++) sumL += dataArray[i];
        for (let i = half; i < dataArray.length; i++) sumR += dataArray[i];

        const targetL = isPlaying ? (sumL / (half * 255)) : 0.05;
        const targetR = isPlaying ? (sumR / ((dataArray.length - half) * 255)) : 0.05;

        // Inertia damping (analog mechanical needle simulation)
        vuLeftRef.current += (targetL - vuLeftRef.current) * 0.22;
        vuRightRef.current += (targetR - vuRightRef.current) * 0.22;

        const meterWidth = (width - 24) / 2;
        const meterHeight = height;

        // Draw Left & Right Meter Faces
        [
          { x: 4, val: vuLeftRef.current, label: 'CH-L' },
          { x: meterWidth + 20, val: vuRightRef.current, label: 'CH-R' }
        ].forEach(meter => {
          // Meter Backplate
          ctx.fillStyle = '#0c0e14';
          ctx.beginPath();
          ctx.roundRect(meter.x, 2, meterWidth, meterHeight - 4, [10]);
          ctx.fill();
          ctx.strokeStyle = 'rgba(255,255,255,0.1)';
          ctx.stroke();

          // Scale Arc
          const arcCenterX = meter.x + meterWidth / 2;
          const arcCenterY = meterHeight + 15;
          const arcRadius = meterHeight * 0.9;

          ctx.beginPath();
          ctx.arc(arcCenterX, arcCenterY, arcRadius, -Math.PI * 0.78, -Math.PI * 0.22);
          ctx.strokeStyle = 'rgba(255,255,255,0.2)';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Red Peak Danger Zone
          ctx.beginPath();
          ctx.arc(arcCenterX, arcCenterY, arcRadius, -Math.PI * 0.35, -Math.PI * 0.22);
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 2.5;
          ctx.stroke();

          // Needle Angle (-45 deg to +45 deg)
          const clampedVal = Math.min(1.0, Math.max(0, meter.val));
          const needleAngle = -Math.PI * 0.75 + clampedVal * (Math.PI * 0.50);

          const needleTipX = arcCenterX + Math.cos(needleAngle) * (arcRadius * 0.92);
          const needleTipY = arcCenterY + Math.sin(needleAngle) * (arcRadius * 0.92);

          // Needle Shadow & Line
          ctx.beginPath();
          ctx.moveTo(arcCenterX, arcCenterY);
          ctx.lineTo(needleTipX, needleTipY);
          ctx.strokeStyle = clampedVal > 0.85 ? '#ef4444' : '#38bdf8';
          ctx.lineWidth = 2;
          ctx.shadowColor = clampedVal > 0.85 ? '#ef4444' : '#38bdf8';
          ctx.shadowBlur = 6;
          ctx.stroke();
          ctx.shadowBlur = 0;

          // Label
          ctx.fillStyle = 'rgba(255,255,255,0.5)';
          ctx.font = '9px monospace';
          ctx.fillText(meter.label, meter.x + 8, 14);
          ctx.fillText(clampedVal > 0.85 ? '+3dB' : '0dB', meter.x + meterWidth - 30, 14);
        });
      }
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [analyserNode, isPlaying, currentTrack, activeThemeColor, barCount, mode]);

  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      <canvas
        ref={canvasRef}
        width={360}
        height={60}
        className="w-full h-full object-contain"
      />
    </div>
  );
};
