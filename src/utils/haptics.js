// Haptic feedback patterns
const HapticPattern = {
  SUCCESS: { type: 'success' },
  WARNING: { type: 'warning' },
  ERROR: { type: 'error' },
  LIGHT: { type: 'light' },
  MEDIUM: { type: 'medium' },
  HEAVY: { type: 'heavy' },
}

// Check if the device supports haptic feedback
const supportsHaptics = () => {
  return 'vibrate' in navigator || 'haptics' in window
}

// Function to trigger haptic feedback
export const triggerHaptic = (pattern = HapticPattern.LIGHT) => {
  if (!supportsHaptics()) return

  try {
    // Try to use the modern Haptics API first
    if ('haptics' in window) {
      switch (pattern.type) {
        case 'success':
          window.haptics.notificationSuccess()
          break
        case 'warning':
          window.haptics.notificationWarning()
          break
        case 'error':
          window.haptics.notificationError()
          break
        case 'light':
          window.haptics.impactLight()
          break
        case 'medium':
          window.haptics.impactMedium()
          break
        case 'heavy':
          window.haptics.impactHeavy()
          break
        default:
          window.haptics.impactLight()
      }
    } else if ('vibrate' in navigator) {
      // Fallback to the Vibration API
      switch (pattern.type) {
        case 'success':
          navigator.vibrate([50])
          break
        case 'warning':
          navigator.vibrate([30, 50, 30])
          break
        case 'error':
          navigator.vibrate([100, 30, 100])
          break
        case 'light':
          navigator.vibrate(10)
          break
        case 'medium':
          navigator.vibrate(20)
          break
        case 'heavy':
          navigator.vibrate(30)
          break
        default:
          navigator.vibrate(10)
      }
    }
  } catch (error) {
    console.debug('Haptic feedback failed:', error)
  }
}

export const HapticFeedback = {
  success: () => triggerHaptic(HapticPattern.SUCCESS),
  warning: () => triggerHaptic(HapticPattern.WARNING),
  error: () => triggerHaptic(HapticPattern.ERROR),
  light: () => triggerHaptic(HapticPattern.LIGHT),
  medium: () => triggerHaptic(HapticPattern.MEDIUM),
  heavy: () => triggerHaptic(HapticPattern.HEAVY),
}
