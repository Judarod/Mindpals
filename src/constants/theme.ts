// MindPals Theme Constants
// "Cozy Core" aesthetic - Soft pastels, rounded edges, high-transparency UI

export const COLORS = {
  // Primary palette
  primary: '#87CEEB', // Sky blue
  secondary: '#E8B4D8', // Soft lavender
  accent: '#FFD700', // Golden (Sun-Bits)

  // Mood colors (No red - using soft purples/grays for negative moods)
  sunny: '#FFE066', // Bright yellow
  cloudy: '#B8D4E8', // Soft blue
  stormy: '#8B7BB0', // Deep purple (not red)
  drizzly: '#A8D5E5', // Light rain blue

  // Character-specific backgrounds
  glimmerBg: ['#FFE4B5', '#FFF8DC', '#FFD700'], // Warm golden
  puddleBg: ['#B8E4F0', '#E0F4FF', '#87CEEB'], // Soft blue
  mossyBg: ['#98D982', '#C8E6C9', '#8FBC8F'], // Forest green

  // UI Colors
  background: '#F5F9FC',
  card: 'rgba(255, 255, 255, 0.85)',
  text: '#2C3E50',
  textLight: '#7F8C9A',
  white: '#FFFFFF',
  overlay: 'rgba(255, 255, 255, 0.7)',

  // Safe-fail states (no harsh colors)
  sleepy: 'rgba(200, 200, 210, 0.6)',

  // Time-based backgrounds
  morning: ['#FFF5E6', '#FFE4CC', '#B8E4F0'],
  afternoon: ['#B8E4F0', '#E0F4FF', '#F5F9FC'],
  evening: ['#FFE4CC', '#E8B4D8', '#DDA0DD'],
  night: ['#2C3A5C', '#4A5A7C', '#6B7B9C'],
};

export const FONTS = {
  regular: 'System',
  bold: 'System',
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BORDER_RADIUS = {
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  full: 9999,
};

export const SHADOWS = {
  soft: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
  },
};

// Breathing animation timings (in ms)
export const BREATHING = {
  inhale: 4000,
  hold: 2000,
  exhale: 4000,
  minDuration: 60000, // 1 minute minimum
  maxDuration: 300000, // 5 minutes maximum
};

// Reward values
export const REWARDS = {
  checkIn: 10,
  meditation1min: 15,
  meditation3min: 30,
  meditation5min: 50,
  streakBonus: 10, // per day in streak
};
