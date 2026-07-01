// Accessibility utilities and helpers
// WCAG 2.1 AA compliance

export const accessibilityLabels = {
  // Navigation
  BACK_BUTTON: 'Go back to previous screen',
  CLOSE_BUTTON: 'Close modal or menu',
  SETTINGS_BUTTON: 'Open settings',

  // Authentication
  EMAIL_INPUT: 'Email address input field',
  PASSWORD_INPUT: 'Password input field',
  CODE_INPUT: 'Verification code input field',
  LOGIN_BUTTON: 'Sign in to your account',
  SIGNUP_BUTTON: 'Create a new account',

  // Helmet
  CONNECT_HELMET: 'Connect your Vela helmet',
  HELMET_INFO: 'Helmet information and status',
  BATTERY_LEVEL: 'Helmet battery level indicator',

  // Impacts
  IMPACT_CARD: 'Impact details and statistics',
  MAX_G_FORCE: 'Maximum G-force measurement',
  SESSION_LIST: 'List of tracking sessions',

  // General
  LOADING: 'Loading content',
  ERROR: 'Error message',
  SUCCESS: 'Success message',
};

export const accessibilityHints = {
  DOUBLE_TAP: 'Double tap to activate',
  SWIPE_TO_DISMISS: 'Swipe left or right to dismiss',
  DOUBLE_TAP_TO_ZOOM: 'Double tap to zoom',
};

export interface AccessibleProps {
  accessible?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: string;
  accessibilityState?: {
    disabled?: boolean;
    selected?: boolean;
    checked?: boolean;
    busy?: boolean;
    expanded?: boolean;
  };
}

export function createAccessibleButtonProps(
  label: string,
  hint?: string
): AccessibleProps {
  return {
    accessible: true,
    accessibilityLabel: label,
    accessibilityHint: hint,
    accessibilityRole: 'button',
  };
}

export function createAccessibleTouchableProps(label: string): AccessibleProps {
  return {
    accessible: true,
    accessibilityLabel: label,
    accessibilityRole: 'button',
  };
}

export function createAccessibleInputProps(label: string): AccessibleProps {
  return {
    accessible: true,
    accessibilityLabel: label,
    accessibilityRole: 'adjustable',
  };
}

export function announceForAccessibility(message: string) {
  // Use AccessibilityInfo.announceForAccessibility for iOS
  // Use announceForAccessibility equivalent for Android
  if (__DEV__) {
    console.log('[A11Y]', message);
  }
}
