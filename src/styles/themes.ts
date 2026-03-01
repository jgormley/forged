// ─────────────────────────────────────────────────────────────────────────────
// Forged Design Tokens — Pastoral Craft Aesthetic
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
    md:   16,
    lg:   24,
    pill: 100,
    full: 9999,
  },

  // ── Typography ───────────────────────────────────────────────────────────
  font: {
    // Font family names must match the keys exported by @expo-google-fonts/*
    // and loaded via useFonts() in app/_layout.tsx.
    family: {
      // Cormorant Upright — display, headings, metrics, app name
      display:       'CormorantUpright_700Bold'   as const,
      displayMedium: 'CormorantUpright_600SemiBold' as const,
      displayLight:  'CormorantUpright_400Regular' as const,
      // Cormorant (regular + italic variant) — pull quotes, motivational text
      italic:        'Cormorant_600SemiBold_Italic' as const,
      italicLight:   'Cormorant_400Regular_Italic'  as const,
      // Crimson Pro — body text, buttons, captions, labels, inputs
      body:          'CrimsonPro_400Regular'  as const,
      bodyMedium:    'CrimsonPro_500Medium'   as const,
      bodySemiBold:  'CrimsonPro_600SemiBold' as const,
      bodyBold:      'CrimsonPro_700Bold'     as const,
    },
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

  // ── Brand / palette constants (same in both modes) ───────────────────────
  palette: {
    // Forge Gold
    gold:      '#C8A84B',
    goldLight: '#E8D07A',
    goldDark:  '#9B7A28',
    // Forest Green
    forest:      '#4A6741',
    forestLight: '#6B8F61',
    forestMuted: '#8FA882',
    // Rust / amber
    rust:      '#8B5A2B',
    rustLight: '#C4874A',
    // Sky blue
    sky:     '#89B4C8',
    // Bloom (warm terracotta)
    bloom:   '#D4897A',
    // Steel (neutral cool)
    steel:      '#4A5568',
    steelLight: '#7A8BA0',
  },

  // ── Habit color palette (10 options shown in the picker) ─────────────────
  habitColors: [
    '#C8A84B', // forge gold
    '#4A6741', // forest green
    '#89B4C8', // sky
    '#D4897A', // bloom
    '#C4874A', // amber
    '#6B8F61', // meadow
    '#8B5A2B', // rust
    '#9B7A28', // gold dark
    '#4A5568', // steel
    '#8FA882', // forest muted
  ] as const,

  // ── Animation durations ──────────────────────────────────────────────────
  duration: {
    fast:   150,
    normal: 300,
    slow:   500,
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// Light theme — Pastoral Day
// Surfaces: cream & parchment. Text: warm ink. Accents: forge gold & forest.
// ─────────────────────────────────────────────────────────────────────────────
export const lightTheme = {
  ...shared,

  colors: {
    // Backgrounds
    background:    '#E8E3D8',  // warm cream
    surface:       '#F9F5EC',  // parchment
    surfaceAlt:    '#EDE8D8',  // alt parchment
    surfaceRaised: '#FFFFFF',  // pure white card

    // Text
    text:          '#2C2416',  // warm ink
    textSecondary: '#5C4F38',  // umber
    textTertiary:  '#8B7A5E',  // dust
    textInverse:   '#F0EAD8',  // warm white (used on dark surfaces)

    // Forge Gold — primary accent
    accent:        '#C8A84B',
    accentLight:   '#E8D07A',
    accentDark:    '#9B7A28',
    accentSubtle:  'rgba(200,168,75,0.12)',

    // Forest Green — success / completion
    success:       '#4A6741',
    successLight:  '#6B8F61',
    successSubtle: 'rgba(74,103,65,0.12)',

    // Rust — warning / challenge
    warning:       '#8B5A2B',
    warningLight:  '#C4874A',
    warningSubtle: 'rgba(139,90,43,0.10)',

    // Error
    error:         '#B04040',
    errorSubtle:   'rgba(176,64,64,0.10)',

    // Supplemental palette
    sky:     '#89B4C8',
    skySubtle:  'rgba(137,180,200,0.15)',
    bloom:   '#D4897A',
    bloomSubtle: 'rgba(212,137,122,0.12)',

    // UI chrome
    border:        'rgba(200,168,75,0.22)',
    borderSubtle:  'rgba(44,36,22,0.10)',
    tabBar:        '#FFFFFF',
    tabBarBorder:  'rgba(44,36,22,0.08)',

    // Streak
    streakFire:    '#C8A84B',

    // Heatmap contribution calendar — gold intensity levels (0=none, 4=full)
    heatmapL0: 'rgba(44,36,22,0.10)',
    heatmapL1: 'rgba(200,168,75,0.45)',
    heatmapL2: 'rgba(200,168,75,0.65)',
    heatmapL3: 'rgba(200,168,75,0.85)',
    heatmapL4: '#C8A84B',

    // Overlays
    overlay:       'rgba(44,36,22,0.50)',
    overlayLight:  'rgba(44,36,22,0.05)',
  },

  // ── Shadows ───────────────────────────────────────────────────────────────
  shadow: {
    sm: {
      shadowColor:   '#2C2416',
      shadowOpacity: 0.07,
      shadowRadius:  4,
      shadowOffset:  { width: 0, height: 2 },
      elevation:     2,
    },
    md: {
      shadowColor:   '#2C2416',
      shadowOpacity: 0.10,
      shadowRadius:  8,
      shadowOffset:  { width: 0, height: 4 },
      elevation:     4,
    },
    lg: {
      shadowColor:   '#2C2416',
      shadowOpacity: 0.15,
      shadowRadius:  16,
      shadowOffset:  { width: 0, height: 8 },
      elevation:     8,
    },
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// Dark theme — Night Forge
// Surfaces: charred earth tones. Text: warm white. Brand colors unchanged.
// ─────────────────────────────────────────────────────────────────────────────
export const darkTheme: typeof lightTheme = {
  ...shared,

  colors: {
    background:    '#12100C',  // char
    surface:       '#1C1912',  // ember
    surfaceAlt:    '#231F17',  // ash
    surfaceRaised: '#2D2820',  // coal

    text:          '#F0EAD8',  // warm white
    textSecondary: '#C4B89A',  // linen
    textTertiary:  '#7A6E58',  // tallow
    textInverse:   '#2C2416',  // warm ink

    // Gold unchanged across modes — brand identity stays constant
    accent:        '#C8A84B',
    accentLight:   '#E8D07A',
    accentDark:    '#9B7A28',
    accentSubtle:  'rgba(200,168,75,0.14)',

    // Green unchanged
    success:       '#4A6741',
    successLight:  '#6B8F61',
    successSubtle: 'rgba(74,103,65,0.20)',

    // Rust unchanged
    warning:       '#8B5A2B',
    warningLight:  '#C4874A',
    warningSubtle: 'rgba(196,135,74,0.15)',

    error:         '#C05050',
    errorSubtle:   'rgba(192,80,80,0.15)',

    sky:        '#89B4C8',
    skySubtle:  'rgba(137,180,200,0.15)',
    bloom:      '#D4897A',
    bloomSubtle:'rgba(212,137,122,0.12)',

    border:       'rgba(200,168,75,0.22)',
    borderSubtle: 'rgba(249,245,236,0.07)',
    tabBar:       '#15120D',
    tabBarBorder: 'rgba(249,245,236,0.06)',

    streakFire:   '#C8A84B',

    heatmapL0: 'rgba(249,245,236,0.08)',
    heatmapL1: 'rgba(200,168,75,0.45)',
    heatmapL2: 'rgba(200,168,75,0.65)',
    heatmapL3: 'rgba(200,168,75,0.85)',
    heatmapL4: '#C8A84B',

    overlay:      'rgba(0,0,0,0.70)',
    overlayLight: 'rgba(249,245,236,0.03)',
  },

  shadow: {
    sm: {
      shadowColor:   '#000000',
      shadowOpacity: 0.35,
      shadowRadius:  4,
      shadowOffset:  { width: 0, height: 2 },
      elevation:     2,
    },
    md: {
      shadowColor:   '#000000',
      shadowOpacity: 0.45,
      shadowRadius:  8,
      shadowOffset:  { width: 0, height: 4 },
      elevation:     4,
    },
    lg: {
      shadowColor:   '#000000',
      shadowOpacity: 0.55,
      shadowRadius:  16,
      shadowOffset:  { width: 0, height: 8 },
      elevation:     8,
    },
  },
}

export type ForgedTheme = typeof lightTheme
