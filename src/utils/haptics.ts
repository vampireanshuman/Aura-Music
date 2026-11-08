/**
 * Apple-grade mobile tactile haptic feedback engine using Navigator.vibrate API
 */
export function triggerHaptic(type: 'light' | 'medium' | 'heavy' | 'selection' | 'success' = 'light') {
  if (typeof window === 'undefined' || !('vibrate' in navigator)) return;

  try {
    switch (type) {
      case 'selection':
        navigator.vibrate(8);
        break;
      case 'light':
        navigator.vibrate(15);
        break;
      case 'medium':
        navigator.vibrate(28);
        break;
      case 'heavy':
        navigator.vibrate(45);
        break;
      case 'success':
        navigator.vibrate([15, 40, 20]);
        break;
      default:
        navigator.vibrate(15);
    }
  } catch {
    // ignore if device restricts vibration without user gesture
  }
}
