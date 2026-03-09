// ─────────────────────────────────────────────────────────────────────────────
// Unistyles v3 TypeScript module augmentation
// Extends the library's generic interfaces so that:
//   • `stylesheet.theme` is typed as ForgedTheme (full autocomplete)
//   • Breakpoints are named and typed throughout the project
//
// NOTE: The import() syntax keeps this file as a global script declaration
// (no top-level imports), ensuring TypeScript picks up the augmentation
// even with moduleDetection: "force".
// ─────────────────────────────────────────────────────────────────────────────

type LightTheme = typeof import('./themes').lightTheme
type DarkTheme  = typeof import('./themes').darkTheme

declare module 'react-native-unistyles' {
  interface UnistylesThemes {
    light: LightTheme
    dark:  DarkTheme
  }

  interface UnistylesBreakpoints {
    xs: number  // 0   — phone portrait
    sm: number  // 375 — standard phone
    md: number  // 768 — tablet portrait
    lg: number  // 1024 — tablet landscape / desktop
  }
}
