# Forged — Development Progress

> This is the single source of truth for build progress and next steps.
> `forged-project-context.md` is the original product spec — don't edit it.

---

## Current Status: Phase 3 in progress — in beta testing

Both iOS (TestFlight) and Android (Google Play internal testing) builds are live and working.
Remaining work: paywall/freemium gate, widgets, store listing polish, final submission.

---

## ✅ Phase 1 — Core Loop (COMPLETE)

### Infrastructure
- [x] Expo SDK 55 stable (upgraded from preview.12), React Native 0.79, React 19, New Architecture
- [x] CNG setup — `ios/` and `android/` gitignored, rebuilt with `npx expo prebuild --clean`
- [x] expo-router v4 file-based routing
- [x] `babel.config.js` — `react-native-worklets/plugin` (Reanimated 4), Unistyles `root: 'src'`
- [x] `app.json` — bundle ID `com.forgedapp.forged`, New Architecture, EAS profiles
- [x] `tsconfig.json` — `@/*` path alias → `src/*`

### Database
- [x] `src/db/schema.ts` — full Drizzle schema: `habits` + `completions` tables
- [x] `src/db/client.ts` — drizzle singleton with change listener enabled
- [x] `src/db/migrations/0000_white_black_knight.sql` — initial migration
- [x] Migration runner wired into `app/_layout.tsx` via `useMigrations()`

### Streak Engine
- [x] `src/utils/streak.ts` — pure TypeScript: `calculateCurrentStreak`, `calculateLongestStreak`, `isStreakAtRisk`, `getCompletionRate`, `getScheduledDaysInWindow`, `isScheduledDay`
- [x] `src/utils/streak.test.ts` — 38 passing tests, all 3 frequency types, full edge case coverage

### State Stores
- [x] `src/stores/habitsStore.ts` — `load`, `add`, `update`, `remove`, `archive`
- [x] `src/stores/completionsStore.ts` — `loadAll` (90-day window), `toggle`
- [x] `src/stores/uiStore.ts` — milestone modal, paywall modal, toast; `getMilestoneTier(streak)`

### Design System
- [x] `src/styles/themes.ts` — full Pastoral Craft tokens (light + dark, spacing, radius, font, colors, shadows)
- [x] `src/styles/unistyles.ts` — `StyleSheet.configure()` with both themes, `adaptiveThemes: true`
- [x] `src/styles/unistyles.d.ts` — TypeScript module augmentation
- [x] `src/components/Pressable.tsx` — shared drop-in with automatic opacity press feedback

### Navigation & Screens
- [x] `app/_layout.tsx` — GestureHandlerRootView, migrations runner, PostHogProvider, MilestoneModal
- [x] `app/(tabs)/_layout.tsx` — 3-tab layout (Today / Progress / Settings)
- [x] `src/components/navigation/CustomTabBar.tsx` — custom bottom tab bar
- [x] `src/components/icons/TabIcons.tsx` — custom pastoral SVG icons
- [x] `src/components/ScreenHeader.tsx` — reusable header with heroCap arc effect

### Core Components
- [x] `src/components/HabitCard.tsx` — animated card: Reanimated 4 fill animation, spring streak badge, haptics, onLongPress
- [x] `src/components/MilestoneModal.tsx` — celebration modal with 100-piece organic confetti (Reanimated 4)

### Habit Management
- [x] `app/(tabs)/index.tsx` — Today view: hero, progress bar, HabitCard list, empty state; wired to stores; long-press → edit
- [x] `app/habit/new.tsx` — Add Habit modal: live preview, emoji picker, 10 color swatches, frequency selector, preset param support
- [x] `app/habit/edit/[id].tsx` — Edit Habit modal: pre-populated form, delete with confirmation

### Legal & Debug
- [x] `src/content/legal.ts` — Privacy Policy + Terms of Service as markdown
- [x] `app/legal/[slug].tsx` — pageSheet modal with markdown renderer
- [x] `app/debug.tsx` — accessible via 5 taps on version; Add mock data, Reset onboarding, Sentry test, PostHog test

---

## ✅ Phase 2 — Content & Features (COMPLETE)

### Stats Dashboard
- [x] `app/(tabs)/progress.tsx` — wired to real data: current/best streak per habit, overall completion rate
- [x] `src/components/HeatmapCalendar.tsx` — year-at-a-glance grid using Skia
- [x] Per-habit sparkline charts (victory-native) on Progress screen
- [ ] Milestone history list on Progress screen

### Notifications
- [x] `src/utils/notifications.ts` — schedule, reschedule, cancel helpers
- [x] Schedule reminders on habit add; reschedule on edit; cancel on delete
- [x] `src/stores/notificationSettingsStore.ts` — dailyReminders, streakAlerts, milestoneCelebrations (all default on, persisted)
- [x] Settings notification toggles enforce the store values (guards in notifications.ts + index.tsx)

### Onboarding
- [x] `app/onboarding.tsx` — 3 screens: Welcome, Pick a habit, Enable notifications
- [x] `src/utils/onboardingPresets.ts` — daily-pages, sleep, workout presets
- [x] First-launch detection via `@forged/onboardingComplete` AsyncStorage key
- [x] Preset param support in `app/habit/new.tsx`

### Settings
- [x] Theme toggle (Light / Dark / System) — persisted via AsyncStorage, restored on launch
- [x] Default reminder time picker — persisted as HH:MM
- [x] Notification toggles (dailyReminders, streakAlerts, milestoneCelebrations) — styled as segmented controls
- [x] Legal navigation (Privacy Policy, Terms of Service)
- [x] 5-tap version easter egg → debug screen

### Crash Reporting
- [x] `@sentry/react-native` — DSN from `EXPO_PUBLIC_SENTRY_DSN`, full sample rates (intentional for now)
- [x] `Sentry.wrap(RootLayout)` in `_layout.tsx`

---

## 🔲 Phase 3 — Monetization (in progress)

### Analytics — PostHog ✅
- [x] `src/analytics/posthog.ts` — singleton, `disabled: !key`, `posthog.debug()` in DEV
- [x] `PostHogProvider` wrapping app — autocapture enabled (touches + app lifecycle), screen tracking disabled (RN v7 incompatibility)
- [x] Events: `habit_created`, `habit_deleted`, `habit_completed`, `streak_milestone`, `onboarding_completed`, `theme_changed`, `notifications_toggled`
- [ ] `ph-label` props on key interactive elements (autocapture labels)
- [x] Remaining events: `paywall_viewed`, `purchase_completed`, `purchase_cancelled`

### RevenueCat ✅
- [x] `react-native-purchases` installed and configured
- [x] `configureRevenueCat()` called at module scope in `_layout.tsx`
- [x] `src/hooks/usePremium.ts` — `isPremium`, `purchase()`, `restore()`, `canAddHabit()`, CustomerInfo listener
- [x] `EXPO_PUBLIC_RC_API_KEY_IOS` + `EXPO_PUBLIC_RC_API_KEY_ANDROID` env vars set

### Bug Fixes (Beta Round 1) ✅
- [x] Heatmap not reflecting today's completions — replaced `useLiveQuery` with `useFocusEffect` on Progress screen
- [x] Deleted habit data persisting in heatmap — enabled `PRAGMA foreign_keys = ON` so cascade delete works
- [x] Low heatmap contrast (L1/L2) — bumped opacity levels in both themes
- [x] Long-press to edit on Progress screen — HabitStatCard wrapped in Pressable; Settings alert updated
- [x] Debug "show modal" button removed from Today screen
- [x] Badge count + notifications not cleared on app open — `AppState` listener calls `dismissAllNotifications` + `setBadgeCountAsync(0)`
- [x] Notification tap didn't navigate to Today tab — added `addNotificationResponseReceivedListener` + cold-start handler
- [x] Expo SDK 55 stable upgrade — all packages updated, `app.json` schema errors resolved, TypeScript errors from new package versions fixed

### Freemium Gate ✅
- [x] Enforce 2-habit limit in `app/habit/new.tsx` — defensive check in `handleSave()` before `add()`
- [x] Gate "Forge a New Habit" / "Forge Your First Habit" buttons in `app/(tabs)/index.tsx` — routes to `/paywall` when limit hit
- [x] Show "Forged Free — Up to 2 habits" vs "Forged Premium — All features unlocked" in settings premium card
- [x] `FREE_HABIT_LIMIT = 2` in `src/hooks/usePremium.ts`

### Paywall Screen ✅
- [x] `app/paywall.tsx` — full UI: medallion, value props card, $3.99 price, purchase CTA, restore button, footer links
- [x] Wire `purchase()` and `restore()` from `usePremium`
- [x] Auto-dismiss when `isPremium` becomes true
- [x] PostHog events: `paywall_viewed`, `purchase_completed`, `purchase_cancelled`

---

## 🔲 Phase 4 — Polish + Submission

### UX & Accessibility
- [ ] Habit detail screen — `app/habit/[id].tsx` is a stub; needs: streak stats, heatmap, completion rate, edit shortcut
- [ ] Loading skeletons + error states
- [ ] Accessibility audit (VoiceOver / TalkBack, color contrast)
- [ ] Look and feel audit against design system (esp. onboarding flow)
- [ ] Safe area audit, especially Android (e.g., privacy policy modal, edit habit modal)

### Settings — Data Actions
- [ ] Export data (CSV) from Settings
- [ ] Delete all data from Settings (with confirmation Alert)

### Analytics Polish
- [ ] `ph-label` props on key interactive elements (HabitCard toggle, add buttons, onboarding options, settings rows, habit form buttons)

### Legal Pages (GitHub Pages) ✅
- [x] `docs/privacy/index.html` — Privacy Policy
- [x] `docs/terms/index.html` — Terms of Service
- [x] `docs/index.html` — landing page linking both
- [x] GitHub Pages enabled from `docs/` on `main` branch
- **Privacy Policy URL:** `https://jgormley.github.io/forged/privacy/`
- **Terms of Service URL:** `https://jgormley.github.io/forged/terms/`

### EAS Build & Store Setup ✅
- [x] EAS CLI installed, `eas login`, project linked (`projectId` in `app.json`)
- [x] `buildNumber` (iOS) and `versionCode` (Android) in `app.json`; `appVersionSource: remote` in `eas.json`
- [x] `google-service-account.json` created (gitignored)
- [x] **iOS:** App created in App Store Connect (bundle ID `com.forgedapp.forged`)
- [x] **iOS:** `eas.json` submit config complete — `appleId`, `ascAppId`, `appleTeamId`
- [x] **iOS:** APNs key generated via EAS; push notifications configured
- [x] **Android:** App created in Google Play Console (package `com.forgedapp.forged`)
- [x] **Android:** Google service account created; "Release Manager" + financial read access granted
- [x] **EAS env vars** set for `production` and `preview` environments:
  - `EXPO_PUBLIC_SENTRY_DSN`, `EXPO_PUBLIC_POSTHOG_API_KEY` (same value both envs)
  - `EXPO_PUBLIC_RC_API_KEY_IOS`, `EXPO_PUBLIC_RC_API_KEY_ANDROID` (different per env)
- [x] `.npmrc` — `legacy-peer-deps=true` so EAS `npm ci` matches local installs
- [x] `eas.json` — Android `releaseStatus: draft` (required until Play Store listing is complete)
- [x] Production builds running and submitted to both stores

### Beta Testing ✅
- [x] **iOS:** App live in TestFlight internal testing; internal testers added
- [x] **Android:** App live in Google Play internal testing track

### Store Listing & Final Submission 🔲
- [ ] App Store screenshots (6.7", 6.1", iPad 12.9")
- [ ] Google Play feature graphic + screenshots
- [ ] App Store metadata (description, keywords, categories) — draft in `forged-project-context.md` Section 12
- [x] Privacy Policy URL added in App Store Connect: `https://jgormley.github.io/forged/privacy/`
- [ ] Complete Play Store listing (required before removing `releaseStatus: draft` from `eas.json`)
- [ ] Final submission: iOS + Android
- [ ] Create promo codes for friends and family 
---

## 🔲 Phase 5 — Widgets

### iOS Widgets 🔲
- [ ] Investigate `expo-widgets` current state with SDK 55 stable (alpha API — may have changed)
- [ ] `widgets/SingleHabitWidget.tsx` — small widget: habit icon, streak, 7-day dots
- [ ] `widgets/MultiHabitWidget.tsx` — medium widget: 3 habits, completion status
- [ ] `src/utils/widgetSync.ts` — push snapshot to App Group on every check-off
- [ ] Add `expo-widgets` plugin to `app.json`
- [ ] Widget data is premium-only gate

---

## Key Technical Notes

### Unistyles v3
- `root: 'src'` in babel.config.js — NOT `'.'` (causes startup crash)
- `useStyles` does NOT exist in v3 — use `useUnistyles()` for inline theme access, `StyleSheet.create((theme) => ...)` at module scope for styles
- Do NOT add `paddingTop: rt.insets.top` inside pageSheet modals — double-applies inset

### Reanimated 4
- Worklets plugin: `react-native-worklets/plugin` — NOT `react-native-reanimated/plugin`
- Use `useSharedValue` + `useAnimatedStyle` + `withTiming`/`withSpring`

### Zustand
- Always select primitive values individually — never return objects from selectors (causes infinite re-render)

### Navigation
- Import `Pressable` from `@/components/Pressable`, not `react-native`
- All hooks before any conditional returns in screen components (hooks ordering crash)

### expo-widgets
- Alpha API — verify against SDK 55 current state before building
- iOS only in v1; compile-time only (no OTA, no hot reload for widget changes)
- Requires App Group for data sharing between app and widget target

### npm / builds
- Always use `npm install --legacy-peer-deps` for third-party packages
- `npx expo install` for Expo SDK packages
- After any `app.json` plugin change: `npx expo prebuild --clean` then `npx expo run:ios`
- `ios/` and `android/` are gitignored — regenerate with prebuild
