// ─────────────────────────────────────────────────────────────────────────────
// Local type overrides for react-native-unistyles v3
//
// The library's built-in .d.ts files have an internal re-export chain
// (specs → web → index) that tsc cannot follow. This file redeclares the
// three exports our code actually uses so that `tsc --noEmit` passes cleanly.
//
// This does NOT affect runtime behaviour — Unistyles' Babel plugin handles
// the real transforms at build time.
// ─────────────────────────────────────────────────────────────────────────────

declare module 'react-native-unistyles' {
  import type { ImageStyle, TextStyle, ViewStyle } from 'react-native'

  // ── Theme types (driven by our augmentation in unistyles-theme.d.ts) ─────
  type UnistylesTheme = UnistylesThemes[keyof UnistylesThemes]

  // ── Mini runtime (subset exposed to stylesheets & useUnistyles) ──────────
  interface UnistylesMiniRuntime {
    readonly colorScheme: string
    readonly themeName?: keyof UnistylesThemes
    readonly hasAdaptiveThemes: boolean
    readonly breakpoint?: keyof UnistylesBreakpoints
    readonly screen: { width: number; height: number }
    readonly pixelRatio: number
    readonly fontScale: number
    readonly insets: { top: number; bottom: number; left: number; right: number }
    readonly isLandscape: boolean
    readonly isPortrait: boolean
  }

  // ── StyleSheet ───────────────────────────────────────────────────────────
  type UnistylesValues = ViewStyle & TextStyle & ImageStyle & {
    variants?: Record<string, Record<string, any>>
    compoundVariants?: Array<{ styles: any }>
    [key: string]: any
  }

  type StyleSheetDefinition = Record<string, UnistylesValues | ((...args: any[]) => UnistylesValues)>

  type StyleSheetWithSuperPowers<S extends StyleSheetDefinition> =
    | ((theme: UnistylesTheme, rt: UnistylesMiniRuntime) => S)
    | S

  interface UnistylesStyleSheet {
    create<S extends StyleSheetDefinition>(
      stylesheet: StyleSheetWithSuperPowers<S>,
    ): S & { useVariants: (variants: any) => void }

    configure(config: {
      themes?: UnistylesThemes
      breakpoints?: UnistylesBreakpoints
      settings?: {
        adaptiveThemes?: boolean
        initialTheme?: keyof UnistylesThemes
        CSSVars?: boolean
      }
    }): void

    hairlineWidth: number
    absoluteFillObject: ViewStyle
    absoluteFill: ViewStyle
    compose<T>(a: T, b: T): T
    flatten<T>(style: T): T
  }

  export const StyleSheet: UnistylesStyleSheet

  // ── UnistylesRuntime ─────────────────────────────────────────────────────
  interface UnistylesRuntimeType {
    readonly colorScheme: string
    readonly themeName: keyof UnistylesThemes
    readonly hasAdaptiveThemes: boolean
    readonly breakpoint: keyof UnistylesBreakpoints | undefined
    readonly screen: { width: number; height: number }
    readonly pixelRatio: number
    readonly fontScale: number
    readonly insets: { top: number; bottom: number; left: number; right: number }
    readonly isLandscape: boolean
    readonly isPortrait: boolean
    setTheme(themeName: keyof UnistylesThemes): void
    setAdaptiveThemes(isEnabled: boolean): void
  }

  export const UnistylesRuntime: UnistylesRuntimeType

  // ── useUnistyles ─────────────────────────────────────────────────────────
  export function useUnistyles(): {
    theme: UnistylesTheme
    rt: UnistylesMiniRuntime
  }
}
