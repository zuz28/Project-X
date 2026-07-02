// Vela design system — Whoop-inspired dark theme.
// Near-black surfaces, white typography, blue reserved for accents only.
export const Colors = {
  // Primary accent (used sparingly: links, active states, small highlights)
  primary: '#4A9EFF',
  primaryDark: '#2B7FE0',

  // Backgrounds — layered dark surfaces
  background: '#0B0D10',          // app background (near-black)
  backgroundSecondary: '#16191F', // cards, sheets
  backgroundTertiary: '#1F232B',  // nested elements on cards

  // Text
  text: '#FFFFFF',
  textSecondary: '#B4BAC4',
  textTertiary: '#7A8290',

  // Text on colored (accent) surfaces — always white
  textOnAccent: '#FFFFFF',

  // Accents
  accent: '#4A9EFF',
  accentGreen: '#3ADB76',
  accentRed: '#FF4D4F',
  accentOrange: '#FFA023',

  // Borders — subtle definition instead of shadows on dark surfaces
  border: '#242933',
  borderLight: '#1B1F27',

  // Status
  success: '#3ADB76',
  warning: '#FFA023',
  danger: '#FF4D4F',
};

export const Typography = {
  // Font family (using system fonts)
  fontFamily: {
    regular: 'System',
    medium: 'System',
    semibold: 'System',
    bold: 'System',
  },

  // Font sizes
  size: {
    xs: 11,
    sm: 12,
    base: 14,
    lg: 16,
    xl: 18,
    '2xl': 20,
    '3xl': 24,
    '4xl': 28,
    '5xl': 32,
    '6xl': 36,
    '7xl': 40,
  },

  // Whoop-style stat labels: small caps with wide tracking
  labelSpacing: 1.2,
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
};

export const Radius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 999,
};

// On dark surfaces borders do the lifting; shadows stay subtle for depth
export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
};

export const Animation = {
  fast: 150,
  normal: 300,
  slow: 500,
  verySlow: 800,
};
