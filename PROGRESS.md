# Forged — Development Progress

## Status: Phase 1 complete — beginning Phase 2

Last commit: `24cb57c` — "Complete Phase 1 core loop + polish"

---

## ✅ Completed

### Environment
- GitHub CLI installed and authenticated
- Xcode + iOS simulator (iPhone 17 Pro) ✓
- Android SDK (Zulu JDK 17, ANDROID_HOME set in ~/.zshenv) ✓
- Physical Android device working (Samsung Galaxy S5, via ADB) ✓

### Project Scaffold
- Expo SDK 55 (preview.12), React Native 0.83.2, React 19
- CNG setup — `ios/` and `android/` are gitignored
- expo-router v4 file-based routing
- `babel.config.js` — `react-native-worklets/plugin` (Reanimated 4), Unistyles plugin (`root: 'src'`)
- `app.json` — bundle ID `com.forgedapp.forged`, New Architecture enabled
- `eas.json` — development / preview / production profiles
- `drizzle.config.ts` — schema at `src/db/schema.ts`, migrations at `src/db/migrations/`
- `tsconfig.json` — `@/*` path alias → `src/*`

### Database
- `src/db/schema.ts` — full Drizzle schema: `habits` + `completions` tables with all columns
- `src/db/client.ts` — `drizzle(openDatabaseSync('forged.db', { enableChangeListener: true }))` singleton
- `src/db/migrations/0000_white_black_knight.sql` — initial migration generated and working
- Migration runner wired into `app/_layout.tsx` via `useMigrations()`

### Streak Engine
- `src/utils/streak.ts` — complete, production-ready pure TypeScript
  - `isScheduledDay`, `getScheduledDaysInWindow`
  - `calculateCurrentStreak`, `calculateLongestStreak`
  - `isStreakAtRisk`, `getCompletionRate`
  - Handles all 3 frequency types: `daily`, `daysOfWeek`, `xPerWeek`
- `src/utils/streak.test.ts` — **38 passing tests**, full edge case coverage

### Zustand Stores
- `src/stores/habitsStore.ts` — `load`, `add`, `update`, `remove`, `archive`
- `src/stores/completionsStore.ts` — `loadAll` (90-day window), `loadForHabit`, `loadToday`, `toggle`
- `src/stores/uiStore.ts` — milestone modal, paywall modal, global loading, toast; `getMilestoneTier(streak)`

### Design System
- `src/styles/themes.ts` — full Pastoral Craft design tokens (light + dark, spacing, radius, font, colors, shadows)
- `src/styles/unistyles.ts` — `StyleSheet.configure()` with both themes, `adaptiveThemes: true`
- `src/styles/unistyles.d.ts` — TypeScript module augmentation
- `src/components/Pressable.tsx` — shared drop-in Pressable with automatic opacity press feedback

### Navigation & Screens
- `app/_layout.tsx` — GestureHandlerRootView, migrations runner, route declarations, MilestoneModal
- `app/(tabs)/_layout.tsx` — 3-tab layout (Today / Progress / Settings)
- `src/components/navigation/CustomTabBar.tsx` — custom bottom tab bar
- `src/components/icons/TabIcons.tsx` — custom pastoral SVG icons
- `src/components/ScreenHeader.tsx` — reusable header with heroCap arc effect

### Tab Screens — fully wired to live data
- `app/(tabs)/index.tsx` — Today view: hero, progress bar, HabitCard list, empty state with CTA; wired to habitsStore + completionsStore; long-press → edit
- `app/(tabs)/progress.tsx` — Stats + Milestones (merged from Forge); placeholder cards for heatmap + sparklines
- `app/(tabs)/settings.tsx` — Settings with manage habits Alert, legal navigation, all sections stubbed

### Components
- `src/components/HabitCard.tsx` — animated card with Reanimated 4 fill animation, spring streak badge, haptics, onLongPress support
- `src/components/ScreenHeader.tsx` — heroCap arc, safe-area aware
- `src/components/MilestoneModal.tsx` — celebration modal with 100-piece organic confetti (seeded RNG, palette colors, Reanimated 4), triggered by uiStore

### Habit Management
- `app/habit/new.tsx` — full Add Habit modal: live HabitCard preview, emoji picker (quick row + full grid modal), 10 color swatches, frequency selector (daily/days/weekly), wired to habitsStore
- `app/habit/edit/[id].tsx` — Edit Habit modal: pre-populated from store, same form as new.tsx, delete with confirmation Alert; all hooks before conditional returns (avoids hooks ordering crash)

### Legal & Settings
- `src/content/legal.ts` — Privacy Policy + Terms of Service as full markdown strings; `LegalSlug` type
- `app/legal/[slug].tsx` — pageSheet modal: drag handle, themed Markdown renderer (`react-native-markdown-display`), Done button
- Settings "Manage habits" shows an Alert with long-press tip
- Settings Privacy Policy / Terms of Service navigate to legal modal

### Crash Reporting
- `@sentry/react-native` installed, `@sentry/react-native/expo` plugin added to `app.json`
- `Sentry.init()` at module level in `_layout.tsx`, disabled in `__DEV__`, `tracesSampleRate: 0.2`
- Root component wrapped with `Sentry.wrap(RootLayout)`
- DSN stored in `EXPO_PUBLIC_SENTRY_DSN` env var (`.env` gitignored, `.env.example` committed)

### App Icon
- `assets/forged-logo.png` — 1024×1024 configured for iOS + Android adaptive icon (`app.json`)

---

## ✅ Phase 1 — Core Loop (COMPLETE)

- [x] streak.ts with full unit test suite
- [x] Drizzle schema + migrations
- [x] Zustand stores (habits, completions, ui)
- [x] HabitCard component with animations + haptics
- [x] Wire Today view to habitsStore + completionsStore
- [x] Add Habit screen (full frequency + emoji + color picker)
- [x] MilestoneModal with confetti celebration
- [x] Edit Habit screen with delete confirmation
- [x] Long-press to edit from Today view
- [x] Legal screens (Privacy Policy, Terms of Service)
- [x] Settings wired (manage habits tip, legal nav)

---

## 🔲 Phase 2 — Content & Stats (current priority)

### 2a — Habit Detail Screen
- [ ] `app/habit/[id].tsx` — full detail view: streak stats, completion rate, frequency label, edit shortcut, 90-day heatmap preview

### 2b — Stats Dashboard (Progress tab)
- [x] Wire real data to Progress screen (current/best streak per habit, overall completion rate)
- [x] `src/components/HeatmapCalendar.tsx` — year-at-a-glance grid using Skia
- [x] Per-habit sparkline charts (victory-native) on Progress screen
- [ ] Milestone history list on Progress screen

### 2c — Notifications
- [x] `expo-notifications` — per-habit reminder scheduling
- [x] Schedule on add, reschedule on edit, cancel on delete
- [x] `src/utils/notifications.ts` utility
- [x] Settings → "Default reminder time" and "Daily reminder" rows wired up

### 2d — Onboarding
- [x] `app/onboarding.tsx` — 3 screens: value prop, first habit creation, notification opt-in
- [x] First-launch detection (AsyncStorage or DB flag)
- [x] Skip straight to Today on subsequent launches

### 2e — Theme Toggle
- [x] Settings → "Theme" row: Light / Dark / System (currently System-only via adaptiveThemes)
- [x] Persist preference via AsyncStorage + Unistyles `setAdaptedTheme`

---

## 🔲 Phase 3 — Monetization & Widgets

- [ ] RevenueCat SDK integration (`react-native-purchases`)
- [ ] `src/hooks/usePremium.ts` — entitlement check (`forged_premium_lifetime`)
- [ ] Freemium gate — 3 habit limit, paywall triggered on 4th add attempt
- [ ] `app/paywall.tsx` — one-time purchase screen ($3.99)
- [ ] Habit template presets (10–15 starter habits on onboarding)
- [ ] `expo-widgets` — small (1 habit) + medium (3 habits) iOS widgets
- [ ] `src/utils/widgetSync.ts` — push snapshot on every check-off via App Group
- [ ] PostHog analytics (`posthog-react-native`)

---

## 🔲 Phase 4 — Polish + Submission

- [ ] Loading skeletons + error states
- [ ] Audit accessibility, including light/dark theme color contrast
- [ ] Audit app for look and feel against the theme/style, including onboarding flow
- [ ] Audit the app for safe area, especially for Android.  E.g., privacy policy and edit habit
- [x] Sentry crash reporting (`@sentry/react-native`)
- [ ] Export data (CSV) from Settings
- [ ] Delete all data from Settings (with confirmation)
- [ ] App Store screenshots (6.7", 6.1", iPad 12.9")
- [ ] Google Play feature graphic + screenshots
- [ ] App Store metadata (description, keywords, categories)
- [ ] TestFlight internal testing → external beta
- [ ] Submit iOS + Android

---

## Key Technical Notes

### Unistyles v3
- `root: 'src'` in babel.config.js (NOT `'.'` — causes startup crash)
- Do NOT call `useStyles()` without a stylesheet argument — crashes at runtime
- Only import `StyleSheet` from `react-native-unistyles`; use module-scope `StyleSheet.create`
- Pass dynamic style values (e.g. habit color) as inline style overrides, not via `useStyles()`
- Do NOT add `paddingTop: rt.insets.top` inside pageSheet modals — double-applies inset

### Reanimated 4
- Use `useSharedValue` + `useAnimatedStyle` + `withTiming`/`withSpring` for all animations
- Worklets plugin is `react-native-worklets/plugin` — NOT `react-native-reanimated/plugin`

### Hooks Rules
- ALL `useCallback`/`useMemo`/`useEffect` hooks must appear BEFORE any conditional returns
- Conditional `return null` guards must come after all hook declarations

### Shared Pressable
- Import `Pressable` from `@/components/Pressable` everywhere (not from `react-native`)
- Automatically applies `opacity: 0.72` on press — no per-callsite boilerplate needed

### @expo/ui — REMOVED
- Caused `NoClassDefFoundError: CommonPropsKt` crash on Android. Removed from package.json.
- Re-add only when needed in Phase 3, after verifying expo-modules-core compatibility.

### npm install
- Always use `--legacy-peer-deps` for third-party packages
- Use `npx expo install <pkg>` for Expo SDK packages to get pinned versions
