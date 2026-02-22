# Forged — Claude Context

This file is automatically loaded at the start of every Claude Code session.
Keep it accurate as the project evolves.

---

## Project Summary

**Forged** is a React Native habit tracker (iOS + Android) built on Expo SDK 55.
The core mechanic is streaks. Monetisation: $3.99 one-time purchase via RevenueCat.
Full spec: `forged-project-context.md`.

---

## Tech Stack (quick reference)

| Layer | Library |
|---|---|
| Framework | Expo SDK 55 (New Architecture only, `expo@next`) |
| Navigation | expo-router v4 (file-based) |
| Styling | **react-native-unistyles v3** (see Design System below) |
| Animations | react-native-reanimated v4 + react-native-worklets |
| Gestures | react-native-gesture-handler v3 |
| Database | expo-sqlite + drizzle-orm + drizzle-kit |
| State | Zustand v5 |
| IAP | react-native-purchases v9 (RevenueCat) |
| Charts | victory-native + @shopify/react-native-skia |
| Widgets | expo-widgets + @expo/ui (alpha, iOS-only in SDK 55) |

---

## Design System — Unistyles v3

### Setup files
- `src/styles/themes.ts` — design tokens (spacing, radius, font, colors, shadows)
- `src/styles/unistyles.ts` — `StyleSheet.configure()` call (imported once in `index.ts`)
- `src/styles/unistyles.d.ts` — TypeScript module augmentation (UnistylesThemes, UnistylesBreakpoints)

### Rules for every UI component

1. **Always import from `react-native-unistyles`**, never from `react-native`:
   ```ts
   import { StyleSheet } from 'react-native-unistyles'
   // NOT: import { StyleSheet } from 'react-native'
   ```

2. **Use `useStyles()` to access the theme** inside components:
   ```ts
   const { styles, theme } = useStyles(stylesheet)
   ```

3. **Define styles with `StyleSheet.create()`** at module scope (bottom of file):
   ```ts
   const stylesheet = StyleSheet.create((theme) => ({
     container: {
       backgroundColor: theme.colors.background,
       padding: theme.spacing.md,
       borderRadius: theme.radius.md,
     },
   }))
   ```

4. **Never hardcode colors**. Always reference `theme.colors.*`:
   ```ts
   // ✅ correct
   color: theme.colors.text
   // ❌ wrong
   color: '#0a0a0a'
   ```

5. **Never hardcode spacing or radius values**. Use `theme.spacing.*` and `theme.radius.*`:
   ```ts
   // ✅ correct
   padding: theme.spacing.md,   // 16
   borderRadius: theme.radius.sm, // 8
   // ❌ wrong
   padding: 16,
   ```

6. **Use variants for conditional styles** (e.g. card state, button size/variant):
   ```ts
   const stylesheet = StyleSheet.create((theme) => ({
     card: {
       variants: {
         state: {
           default: { backgroundColor: theme.colors.surface },
           checked: { backgroundColor: theme.colors.accent },
         },
       },
     },
   }))
   // Usage:
   const { styles } = useStyles(stylesheet, { state: isChecked ? 'checked' : 'default' })
   ```

7. **Shadows**: apply `theme.shadow.sm / .md / .lg` (spreads the full iOS + Android shadow object).

8. **Breakpoints** (use sparingly — phone-first, tablet is secondary):
   ```ts
   fontSize: { xs: 13, sm: 15, md: 17 }
   ```

9. **Dark mode is automatic** via `adaptiveThemes: true`. Do not use `ColorScheme` hooks.

10. **Always use `theme.font.family.*` for fontFamily**. Never hardcode font family strings:
    ```ts
    // ✅ correct
    fontFamily: theme.font.family.display,
    // ❌ wrong
    fontFamily: 'CormorantUpright_700Bold',
    ```

10. **Animated themes** (Reanimated 4): if a style property needs to animate between themes,
    use `useAnimatedTheme()` from `react-native-unistyles` instead of `useStyles()`.

### Design token quick reference

```ts
// ── Spacing ──────────────────────────────────────────────────────────────────
theme.spacing.xs    // 4
theme.spacing.sm    // 8
theme.spacing.md    // 16
theme.spacing.lg    // 24
theme.spacing.xl    // 32
theme.spacing.xxl   // 48
theme.spacing.xxxl  // 64

// ── Border radius ────────────────────────────────────────────────────────────
theme.radius.xs    // 4
theme.radius.sm    // 8
theme.radius.md    // 16
theme.radius.lg    // 24
theme.radius.pill  // 100  ← buttons, tags, pills
theme.radius.full  // 9999 ← circular

// ── Font families (always use these — never hardcode family strings) ─────────
theme.font.family.display        // 'CormorantUpright_700Bold'   — headlines, numbers
theme.font.family.displayMedium  // 'CormorantUpright_600SemiBold'
theme.font.family.displayLight   // 'CormorantUpright_400Regular'
theme.font.family.italic         // 'Cormorant_600SemiBold_Italic' — motivational quotes
theme.font.family.italicLight    // 'Cormorant_400Regular_Italic'
theme.font.family.body           // 'CrimsonPro_400Regular'  ← default body
theme.font.family.bodyMedium     // 'CrimsonPro_500Medium'
theme.font.family.bodySemiBold   // 'CrimsonPro_600SemiBold'
theme.font.family.bodyBold       // 'CrimsonPro_700Bold'

// ── Font sizes ───────────────────────────────────────────────────────────────
theme.font.size.xs      // 11
theme.font.size.sm      // 13
theme.font.size.md      // 15  ← body default
theme.font.size.lg      // 17  ← large body / subheading
theme.font.size.xl      // 22
theme.font.size.xxl     // 28
theme.font.size.display // 36

// ── Colors ───────────────────────────────────────────────────────────────────
// Backgrounds
theme.colors.background    // light: #E8E3D8 cream  | dark: #12100C char
theme.colors.surface       // light: #F9F5EC parchment | dark: #1C1912 ember
theme.colors.surfaceAlt    // light: #EDE8D8          | dark: #231F17 ash
theme.colors.surfaceRaised // light: #FFFFFF           | dark: #2D2820 coal

// Text
theme.colors.text           // light: #2C2416 ink   | dark: #F0EAD8 warm white
theme.colors.textSecondary  // light: #5C4F38 umber | dark: #C4B89A linen
theme.colors.textTertiary   // light: #8B7A5E dust  | dark: #7A6E58 tallow
theme.colors.textInverse    // light: #F0EAD8       | dark: #2C2416

// Forge Gold (primary accent — unchanged across modes)
theme.colors.accent        // #C8A84B
theme.colors.accentLight   // #E8D07A
theme.colors.accentDark    // #9B7A28
theme.colors.accentSubtle  // rgba(200,168,75, 0.12-0.14)

// Forest Green (success / completion — unchanged across modes)
theme.colors.success       // #4A6741
theme.colors.successLight  // #6B8F61
theme.colors.successSubtle // rgba(74,103,65, 0.12-0.20)

// Rust (warning / challenge)
theme.colors.warning       // #8B5A2B
theme.colors.warningLight  // #C4874A
theme.colors.warningSubtle

// Supplemental
theme.colors.sky / .skySubtle
theme.colors.bloom / .bloomSubtle
theme.colors.error / .errorSubtle

// UI chrome
theme.colors.border / .borderSubtle
theme.colors.tabBar / .tabBarBorder
theme.colors.overlay / .overlayLight
theme.colors.streakFire    // #C8A84B (same as accent)

// ── Shared palette constants (use in gradient stops, svg fills) ──────────────
theme.palette.gold / .goldLight / .goldDark
theme.palette.forest / .forestLight / .forestMuted
theme.palette.rust / .rustLight
theme.palette.sky / .bloom
```

---

## Key Architectural Rules

### Routing
- File-based via expo-router v4. Screens live in `app/`.
- Modal screens use `presentation: 'modal'` in `_layout.tsx`.
- No navigation imports from `@react-navigation/*` directly — use `expo-router` hooks.

### Database
- Schema defined in `src/db/schema.ts` (Drizzle).
- Migrations auto-generated: `npm run db:generate`.
- Reactive queries: `useLiveQuery` from `drizzle-orm/expo-sqlite`.
- `FrequencyConfig` type is single-sourced in `src/utils/streak.ts`, re-exported from schema.

### State
- Zustand stores in `src/stores/`. Import store hooks directly, no context wrapping.
- `habitsStore` — CRUD for habits.
- `completionsStore` — toggle today's completions.
- `uiStore` — modals (milestone, paywall), toasts.

### Streak logic
- All streak calculations in `src/utils/streak.ts` (pure TS, no RN imports).
- Unit tests: `src/utils/streak.test.ts` (38 tests, ts-jest + node environment).

### Animations
- Use Reanimated 4 CSS animations API (`useAnimatedStyle`, `withSpring`, `withTiming`).
- Worklets plugin is `react-native-worklets/plugin` — NOT `react-native-reanimated/plugin`.

### Monetisation
- RevenueCat hook: `src/hooks/usePremium.ts`.
- Entitlement: `forged_premium_lifetime`.
- Free tier: max 3 habits (`FREE_HABIT_LIMIT = 3`).
- API keys: `EXPO_PUBLIC_RC_API_KEY_IOS` / `EXPO_PUBLIC_RC_API_KEY_ANDROID` env vars.

### CNG (Continuous Native Generation)
- `ios/` and `android/` are gitignored — never commit them.
- Regenerate with `npx expo prebuild --clean`.
- After installing any native module, rebuild: `npx expo run:ios`.
- Use `npx expo install <pkg>` for Expo SDK packages (gets pinned versions).
- Use `npm install --legacy-peer-deps` for third-party packages (community deps still list react@^18).

---

## Common Pitfalls

- Do NOT import `StyleSheet` from `react-native` — it bypasses Unistyles.
- Do NOT use `useColorScheme()` from React Native — themes are handled by Unistyles.
- Do NOT hardcode colors, spacing, or radii.
- Do NOT put streak logic in components — keep it in `src/utils/streak.ts`.
- Do NOT commit ios/ or android/ directories.
- Do NOT use `react-native-reanimated/plugin` in babel — Reanimated 4 uses worklets plugin.
