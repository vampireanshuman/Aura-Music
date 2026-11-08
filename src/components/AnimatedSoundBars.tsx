import React from 'react';
import { useAudio } from '../context/AudioContext';

interface AnimatedSoundBarsProps {
  isPlaying: boolean;
  color?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const AnimatedSoundBars: React.FC<AnimatedSoundBarsProps> = ({
  isPlaying,
  color,
  className = '',
  size = 'md'
}) => {
  const { settings, activeThemeColor } = useAudio();
  const barColor = color || activeThemeColor || '#fa2d48';
  const style = settings?.soundbarStyle || 'apple-4bars';

  if (style === 'off') {
    return null;
  }

  const heights = {
    sm: 'h-3.5 gap-0.5',
    md: 'h-5 gap-0.5',
    lg: 'h-6 gap-1'
  }[size];

  const barWidth = {
    sm: 'w-[2px]',
    md: 'w-[2.5px]',
    lg: 'w-[3px]'
  }[size];

  if (style === 'subtle-3bars') {
    return (
      <div className={`flex items-end justify-center ${heights} ${className}`} title={isPlaying ? 'Playing' : 'Paused'}>
        <span
          className={`rounded-full transition-all duration-300 ${barWidth} ${
            isPlaying ? 'animate-soundbar-1' : 'h-[25%]'
          }`}
          style={{ backgroundColor: barColor }}
        />
        <span
          className={`rounded-full transition-all duration-300 ${barWidth} ${
            isPlaying ? 'animate-soundbar-3' : 'h-[60%]'
          }`}
          style={{ backgroundColor: barColor }}
        />
        <span
          className={`rounded-full transition-all duration-300 ${barWidth} ${
            isPlaying ? 'animate-soundbar-2' : 'h-[35%]'
          }`}
          style={{ backgroundColor: barColor }}
        />
      </div>
    );
  }

  if (style === 'audiophile-8bars') {
    return (
      <div className={`flex items-end justify-center ${heights} ${className}`} title={isPlaying ? 'Playing' : 'Paused'}>
        {[1, 2, 3, 4, 3, 2, 4, 1].map((animIdx, idx) => (
          <span
            key={idx}
            className={`rounded-full transition-all duration-300 ${barWidth} ${
              isPlaying ? `animate-soundbar-${animIdx}` : `h-[${25 + (idx % 3) * 15}%]`
            }`}
            style={{ backgroundColor: barColor }}
          />
        ))}
      </div>
    );
  }

  // Default: apple-4bars
  return (
    <div className={`flex items-end justify-center ${heights} ${className}`} title={isPlaying ? 'Playing' : 'Paused'}>
      <span
        className={`rounded-full transition-all duration-300 ${barWidth} ${
          isPlaying ? 'animate-soundbar-1' : 'h-[25%]'
        }`}
        style={{ backgroundColor: barColor }}
      />
      <span
        className={`rounded-full transition-all duration-300 ${barWidth} ${
          isPlaying ? 'animate-soundbar-2' : 'h-[40%]'
        }`}
        style={{ backgroundColor: barColor }}
      />
      <span
        className={`rounded-full transition-all duration-300 ${barWidth} ${
          isPlaying ? 'animate-soundbar-3' : 'h-[60%]'
        }`}
        style={{ backgroundColor: barColor }}
      />
      <span
        className={`rounded-full transition-all duration-300 ${barWidth} ${
          isPlaying ? 'animate-soundbar-4' : 'h-[30%]'
        }`}
        style={{ backgroundColor: barColor }}
      />
    </div>
  );
};
