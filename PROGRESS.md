# Forged — Development Progress

## Status: Phase 1 in progress — scaffold complete, app boots on simulator

---

## Completed

### Environment
- GitHub CLI installed and authenticated
- Xcode + iOS simulator runtimes installed (iPhone 17 Pro)
- CocoaPods installed via Homebrew

### Project Scaffold
- Expo SDK 55 (preview.12), React Native 0.83.2, React 19
- CNG setup — `ios/` and `android/` are gitignored, generated on demand via `expo prebuild`
- expo-router v4 file-based routing
- All screen files stubbed out per spec structure
- `babel.config.js` — uses `react-native-worklets/plugin` (Reanimated 4 requirement, NOT the old `react-native-reanimated/plugin`)
- `app.json` — bundle ID `com.forgedapp.forged`, New Architecture enabled, correct plugins
- `eas.json` — development / preview / production build profiles
- `drizzle.config.ts` — points at `src/db/schema.ts`, outputs migrations to `src/db/migrations/`
- `tsconfig.json` — `@/*` path alias → `src/*`

### Database Schema
- `src/db/schema.ts` — full Drizzle schema: `habits` and `completions` tables
- `src/db/client.ts` — `drizzle(openDatabaseSync('forged.db'))` singleton

### Root Layout
- `app/_layout.tsx` — `GestureHandlerRootView` wrapper, all routes with correct modal presentations
- `app/(tabs)/_layout.tsx` — tab bar with dark/light theme support

### Dependencies (all at correct SDK 55 versions)
- expo-router, expo-sqlite, expo-haptics, expo-notifications, expo-dev-client
- react-native-reanimated v4, react-native-worklets, react-native-gesture-handler v3
- drizzle-orm, zustand v5
- victory-native + @shopify/react-native-skia (charts)
- react-native-purchases v9 (RevenueCat)
- expo-widgets + @expo/ui (alpha — iOS widgets)

### Verified
- App builds and runs on iPhone 17 Pro simulator ✓
- TypeScript compiles clean ✓

---

## Next Steps

### Phase 1 — Core Loop (current)
- [ ] `src/utils/streak.ts` — pure TypeScript streak engine with 20+ unit tests (build this first)
- [ ] Zustand stores — `habitsStore`, `completionsStore`, `uiStore`
- [ ] DB migrations — `drizzle-kit generate`, wire up migration runner on app startup
- [ ] `HabitCard` component — Reanimated 4 fill animation, haptics, streak counter spring
- [ ] Today view (`app/(tabs)/index.tsx`) — habit list, date header, completion summary
- [ ] Add/Edit habit screen — name, icon, color, frequency, reminder, category

### Phase 2 — Priority Features
- [ ] `expo-notifications` per-habit scheduling (reschedule on edit, cancel on delete)
- [ ] Stats dashboard — overview cards, per-habit sparklines, weekly trend chart
- [ ] 365-day heatmap component
- [ ] Habit detail screen
- [ ] Onboarding flow (3 screens)
- [ ] Light/dark/system theming

### Phase 3 — Widgets + Monetization
- [ ] Upgrade to SDK 55 stable (when released)
- [ ] `expo-widgets` — small (1 habit) + medium (3 habits) iOS widgets
- [ ] `src/utils/widgetSync.ts` — push data snapshot on every check-off
- [ ] RevenueCat SDK integration
- [ ] Freemium gates — 3 habit limit, paywall on 4th habit attempt
- [ ] Paywall screen — widget screenshot hero, $3.99 CTA
- [ ] Habit template presets (10–15)

### Phase 4 — Polish + Submission
- [ ] App icon (shows in widget, home screen, store)
- [ ] Empty states, error states, loading skeletons
- [ ] EAS build profiles configured and tested
- [ ] Privacy policy
- [ ] App Store Connect screenshots (6.7", 6.1", iPad 12.9")
- [ ] Google Play feature graphic + screenshots
- [ ] TestFlight internal testing on real devices
- [ ] Submit to App Store and Google Play

---

## Key Technical Notes

### Reanimated 4 — Critical
Babel plugin changed from v3. Must use `react-native-worklets/plugin` in `babel.config.js`, NOT `react-native-reanimated/plugin`.

Use CSS animations API for state-driven animations (habit check-off card fill, number counters).
Use worklets for gesture-driven interactions and milestone celebration modal.

### expo-widgets — Alpha Warning
`expo-widgets` is alpha status. API may break before SDK 55 stable. Keep widget code isolated in `widgets/` directory. Widget UI is compiled native code — no OTA updates, no hot reload for widget changes.

### npm install
Always use `--legacy-peer-deps` for this project. Some RN community packages (`react-native-purchases`, `victory-native`, `@shopify/react-native-skia`) still declare `peerDependencies: { react: "^18" }` even though they work with React 19. This will resolve when SDK 55 goes stable.

Use `npx expo install <package>` (not `npm install`) for any Expo SDK packages to get the correct SDK-pinned version.

### CNG Workflow
`ios/` and `android/` are gitignored. When adding a new native package:
1. Install the package
2. Add its config plugin to `app.json` if it has one
3. Delete `ios/` and run `npx expo run:ios` to regenerate
