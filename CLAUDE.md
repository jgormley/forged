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

10. **Animated themes** (Reanimated 4): if a style property needs to animate between themes,
    use `useAnimatedTheme()` from `react-native-unistyles` instead of `useStyles()`.

### Design token quick reference

```ts
// Spacing
theme.spacing.xs  // 4
theme.spacing.sm  // 8
theme.spacing.md  // 16
theme.spacing.lg  // 24
theme.spacing.xl  // 32
theme.spacing.xxl // 48
theme.spacing.xxxl // 64

// Border radius
theme.radius.xs   // 4
theme.radius.sm   // 8
theme.radius.md   // 12
theme.radius.lg   // 16
theme.radius.xl   // 24
theme.radius.full // 9999

// Font sizes
theme.font.size.xs  // 11
theme.font.size.sm  // 13
theme.font.size.md  // 15  ← body default
theme.font.size.lg  // 17  ← large body / subheading
theme.font.size.xl  // 22
theme.font.size.xxl // 28
theme.font.size.display // 36

// Brand color
theme.colors.accent       // #FF6B35 (orange)
theme.colors.accentSubtle // #FF6B3520 / #FF6B3530

// Semantic
theme.colors.success / .successSubtle
theme.colors.warning / .warningSubtle
theme.colors.error   / .errorSubtle
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
