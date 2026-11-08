export function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export function formatRemainingTime(current: number, duration: number): string {
  if (isNaN(duration) || duration <= 0) return '-0:00';
  const remaining = Math.max(0, duration - current);
  return `-${formatTime(remaining)}`;
}
