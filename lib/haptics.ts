/**
 * Haptic feedback utilities using the Web Vibration API.
 * Silently no-ops on unsupported browsers (desktop, iOS Safari).
 */
function vibrate(pattern: number | number[]) {
  if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
    try {
      navigator.vibrate(pattern);
    } catch {
      // silently ignore
    }
  }
}

/** Short tap — mark placed */
export function vibrateMove() {
  vibrate(18);
}

/** Double tap — oldest mark vanished */
export function vibrateVanish() {
  vibrate([40, 20, 40]);
}

/** Victory pattern */
export function vibrateWin() {
  vibrate([80, 40, 80, 40, 160]);
}
