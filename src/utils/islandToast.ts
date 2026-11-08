/**
 * Dispatches an event to display a 2.5s non-intrusive top toast notification
 * inside the compact Dynamic Island without cluttering the main UI.
 */
export function showIslandToast(message: string) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('aura-island-toast', { detail: { message } }));
  }
}
