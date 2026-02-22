// ─────────────────────────────────────────────────────────────────────────────
// Forged Design Tokens
// Update these values when finalising the design system.
// Both themes must have identical shapes — TypeScript enforces this.
// ─────────────────────────────────────────────────────────────────────────────

const shared = {
  // ── Spacing scale ────────────────────────────────────────────────────────
  spacing: {
    xs:   4,
    sm:   8,
    md:   16,
    lg:   24,
    xl:   32,
    xxl:  48,
    xxxl: 64,
  },

  // ── Border radius ────────────────────────────────────────────────────────
  radius: {
    xs:   4,
    sm:   8,
    md:   12,
    lg:   16,
    xl:   24,
    full: 9999,
  },

  // ── Typography ───────────────────────────────────────────────────────────
  font: {
    size: {
      xs:      11,
      sm:      13,
      md:      15,
      lg:      17,
      xl:      22,
      xxl:     28,
      display: 36,
    },
    weight: {
      regular:  '400' as const,
      medium:   '500' as const,
      semibold: '600' as const,
      bold:     '700' as const,
    },
    lineHeight: {
      tight:  1.2,
      normal: 1.5,
      loose:  1.8,
    },
  },

  // ── Habit color palette (10 options shown in the picker) ─────────────────
  // These are the accent/fill colors for habit cards when checked.
  habitColors: [
    '#FF6B35', // brand orange
    '#f59e0b', // amber
    '#22c55e', // green
    '#3b82f6', // blue
    '#8b5cf6', // violet
    '#ec4899', // pink
    '#06b6d4', // cyan
    '#84cc16', // lime
    '#f97316', // orange-alt
    '#6366f1', // indigo
  ] as const,

  // ── Animation durations ──────────────────────────────────────────────────
  duration: {
    fast:   150,
    normal: 300,
    slow:   500,
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// Light theme
// ─────────────────────────────────────────────────────────────────────────────
export const lightTheme = {
  ...shared,

  colors: {
    // Backgrounds
    background:    '#ffffff',
    surface:       '#f5f5f5',
    surfaceRaised: '#ffffff',

    // Text
    text:          '#0a0a0a',
    textSecondary: '#555555',
    textTertiary:  '#999999',
    textInverse:   '#ffffff',

    // Brand
    accent:        '#FF6B35',
    accentSubtle:  '#FF6B3520',

    // Semantic
    success:       '#22c55e',
    successSubtle: '#22c55e20',
    warning:       '#f59e0b',
    warningSubtle: '#f59e0b20',
    error:         '#ef4444',
    errorSubtle:   '#ef444420',

    // UI chrome
    border:        '#e5e5e5',
    borderStrong:  '#cccccc',
    tabBar:        '#ffffff',
    tabBarBorder:  '#f0f0f0',

    // Streak fire
    streakFire:    '#FF6B35',

    // Overlay
    overlay:       'rgba(0,0,0,0.5)',
    overlayLight:  'rgba(0,0,0,0.08)',
  },

  // ── Shadows (light theme only — Android uses elevation) ──────────────────
  shadow: {
    sm: {
      shadowColor:   '#000000',
      shadowOpacity: 0.06,
      shadowRadius:  4,
      shadowOffset:  { width: 0, height: 2 },
      elevation:     2,
    },
    md: {
      shadowColor:   '#000000',
      shadowOpacity: 0.10,
      shadowRadius:  8,
      shadowOffset:  { width: 0, height: 4 },
      elevation:     4,
    },
    lg: {
      shadowColor:   '#000000',
      shadowOpacity: 0.15,
      shadowRadius:  16,
      shadowOffset:  { width: 0, height: 8 },
      elevation:     8,
    },
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// Dark theme — same shape, different values
// ─────────────────────────────────────────────────────────────────────────────
export const darkTheme: typeof lightTheme = {
  ...shared,

  colors: {
    background:    '#0a0a0a',
    surface:       '#1a1a1a',
    surfaceRaised: '#242424',

    text:          '#ffffff',
    textSecondary: '#aaaaaa',
    textTertiary:  '#555555',
    textInverse:   '#0a0a0a',

    accent:        '#FF6B35',
    accentSubtle:  '#FF6B3530',

    success:       '#22c55e',
    successSubtle: '#22c55e25',
    warning:       '#f59e0b',
    warningSubtle: '#f59e0b25',
    error:         '#ef4444',
    errorSubtle:   '#ef444425',

    border:        '#2a2a2a',
    borderStrong:  '#3a3a3a',
    tabBar:        '#0a0a0a',
    tabBarBorder:  '#1a1a1a',

    streakFire:    '#FF6B35',

    overlay:       'rgba(0,0,0,0.7)',
    overlayLight:  'rgba(255,255,255,0.06)',
  },

  shadow: {
    sm: {
      shadowColor:   '#000000',
      shadowOpacity: 0.3,
      shadowRadius:  4,
      shadowOffset:  { width: 0, height: 2 },
      elevation:     2,
    },
    md: {
      shadowColor:   '#000000',
      shadowOpacity: 0.4,
      shadowRadius:  8,
      shadowOffset:  { width: 0, height: 4 },
      elevation:     4,
    },
    lg: {
      shadowColor:   '#000000',
      shadowOpacity: 0.5,
      shadowRadius:  16,
      shadowOffset:  { width: 0, height: 8 },
      elevation:     8,
    },
  },
}

export type ForgedTheme = typeof lightTheme
