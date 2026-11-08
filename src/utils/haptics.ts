export type HapticFeedbackType = 
  | 'tick' 
  | 'light' 
  | 'medium' 
  | 'heavy' 
  | 'selection' 
  | 'success';

/**
 * Apple-grade mobile tactile haptic feedback engine using Navigator.vibrate API
 * Delivers precise mechanical feedback:
 * - 'tick' (10ms): Quick razor-light ticks during scrubber & slider dragging
 * - 'selection' / 'light' (12ms): Subtle tap on list items and small controls
 * - 'medium' (25ms): Firm feedback on play/pause, skips, and preset clicks
 * - 'heavy' (40ms): Deep spring rebound when opening modals or switching main tabs
 * - 'success' ([15, 35, 20]): Confirmation on favoriting tracks or changing audio codecs
 */
export function triggerHaptic(type: HapticFeedbackType = 'light') {
  if (typeof window === 'undefined' || !('vibrate' in navigator)) return;

  try {
    switch (type) {
      case 'tick':
        navigator.vibrate(10);
        break;
      case 'selection':
        navigator.vibrate(10);
        break;
      case 'light':
        navigator.vibrate(12);
        break;
      case 'medium':
        navigator.vibrate(25);
        break;
      case 'heavy':
        navigator.vibrate(40);
        break;
      case 'success':
        navigator.vibrate([15, 35, 20]);
        break;
      default:
        navigator.vibrate(12);
    }
  } catch {
    // Ignore if device restricts vibration without explicit gesture
  }
}

