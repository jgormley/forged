# Forged — Development Progress

## Status: Phase 1 nearly complete — MilestoneModal + Edit screen remaining

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
- `app/_layout.tsx` — `GestureHandlerRootView`, migrations runner, route declarations
- `app/(tabs)/_layout.tsx` — 3-tab layout (Today / Progress / Settings)
- `src/components/navigation/CustomTabBar.tsx` — custom bottom tab bar
- `src/components/icons/TabIcons.tsx` — custom pastoral SVG icons
- `src/components/ScreenHeader.tsx` — reusable header with heroCap arc effect

### Tab Screens — fully wired to live data
- `app/(tabs)/index.tsx` — Today view: hero, progress bar, HabitCard list, empty state; wired to habitsStore + completionsStore
- `app/(tabs)/progress.tsx` — Stats + Milestones (merged from Forge); placeholder cards for heatmap + sparklines
- `app/(tabs)/settings.tsx` — Settings with all sections stubbed

### Components
- `src/components/HabitCard.tsx` — animated card with Reanimated 4 fill animation, spring streak badge, haptics
- `src/components/ScreenHeader.tsx` — heroCap arc, safe-area aware

### Habit Management
- `app/habit/new.tsx` — full Add Habit modal: live HabitCard preview, emoji picker (quick row + full grid modal), 10 color swatches, frequency selector (daily/days/weekly), wired to habitsStore

### App Icon
- `assets/forged-logo.png` — 1024×1024 configured for iOS + Android adaptive icon (`app.json`)

---

## 🔲 Phase 1 — Core Loop (nearly done)

- [x] streak.ts with full unit test suite
- [x] Drizzle schema + migrations
- [x] Zustand stores
- [x] HabitCard component with animations + haptics
- [x] Wire Today view to habitsStore + completionsStore
- [x] Add Habit screen
- [ ] **MilestoneModal** ← NEXT — triggered by uiStore.showMilestone on 7/30/100-day streaks
- [ ] **Edit Habit screen** (`app/habit/edit/[id].tsx`) — tap habit to edit name/icon/color/frequency

---

## 🔲 Phase 2 — Priority Features

- [ ] `expo-notifications` — per-habit reminder scheduling (schedule on add, reschedule on edit, cancel on delete)
- [ ] Stats dashboard — real data wired to Progress screen (current/best streak, completion rate)
- [ ] HeatmapCalendar component (victory-native / Skia) — year-at-a-glance on Progress screen
- [ ] Per-habit sparklines on Progress screen
- [ ] Habit detail screen (`app/habit/[id].tsx`) — full history, streak chart, edit shortcut
- [ ] Onboarding flow (`app/onboarding.tsx`) — 3 screens shown on first launch
- [ ] Light/dark/system theme toggle in settings

---

## 🔲 Phase 3 — Widgets + Monetization

- [ ] RevenueCat SDK integration (`react-native-purchases`)
- [ ] Freemium gates — 3 habit limit, paywall on 4th attempt
- [ ] Paywall screen (`app/paywall.tsx`)
- [ ] Habit template presets (10–15 starter habits)
- [ ] `expo-widgets` small (1 habit) + medium (3 habits) iOS widgets
- [ ] `src/utils/widgetSync.ts` — push snapshot on every check-off
- [ ] PostHog analytics (`posthog-react-native`)

---

## 🔲 Phase 4 — Polish + Submission

- [ ] Empty states, error states, loading skeletons
- [ ] Sentry crash reporting (`@sentry/react-native`)
- [ ] Privacy policy
- [ ] App Store screenshots (6.7", 6.1", iPad 12.9")
- [ ] Google Play feature graphic + screenshots
- [ ] TestFlight internal testing
- [ ] Submit both stores

---

## Key Technical Notes

### Unistyles v3
- `root: 'src'` in babel.config.js (NOT `'.'` — causes startup crash)
- Do NOT call `useStyles()` without a stylesheet argument — crashes at runtime
- Only import `StyleSheet` from `react-native-unistyles`; use module-scope `StyleSheet.create`
- Pass dynamic style values (e.g. habit color) as inline style overrides, not via `useStyles()`

### Reanimated 4
- Use `useSharedValue` + `useAnimatedStyle` + `withTiming`/`withSpring` for all animations
- Worklets plugin is `react-native-worklets/plugin` — NOT `react-native-reanimated/plugin`

### Shared Pressable
- Import `Pressable` from `@/components/Pressable` everywhere (not from `react-native`)
- Automatically applies `opacity: 0.72` on press — no per-callsite boilerplate needed

### @expo/ui — REMOVED
- Caused `NoClassDefFoundError: CommonPropsKt` crash on Android. Removed from package.json.
- Re-add only when needed in Phase 3, after verifying expo-modules-core compatibility.

### npm install
- Always use `--legacy-peer-deps` for third-party packages
- Use `npx expo install <pkg>` for Expo SDK packages to get pinned versions
