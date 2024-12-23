// Haptic feedback using the Web Vibration API
const HapticPattern = {
  SUCCESS: [50],
  WARNING: [30, 50, 30],
  ERROR: [100, 30, 100],
  LIGHT: [15],
  MEDIUM: [25],
  HEAVY: [35],
}

// Check if the device supports vibration
const supportsHaptics = () => {
  return 'vibrate' in navigator
}

// Function to trigger haptic feedback
export const triggerHaptic = (pattern) => {
  if (!supportsHaptics()) return

  try {
    navigator.vibrate(pattern)
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
