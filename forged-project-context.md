# Forged: Habit Builder — Full Project Context

> This document captures all planning decisions, architecture choices, and feature specifications from the initial ideation session. Use this as the source of truth for development.

---

## 1. Project Overview

**App Name:** Forged (display name), subtitle "Build habits that stick"
**App Store Name:** `Forged`
**App Store Subtitle:** `Build habits that stick`
**Category:** Health & Fitness / Productivity
**Platforms:** iOS + Android (via React Native / Expo)
**Goal:** A beautifully simple habit tracker where the core mechanic is the *streak* — building an unbroken chain creates psychological momentum.

### Origin & Rationale
- Inspired by **Streaks** ($4.99, consistently top 50 paid apps on iOS)
- Market validated: people pay $2.99–$4.99 one-time for well-designed habit trackers
- Competitive landscape: Streaks, Habitify, Done, Habit - Daily Tracker — not winner-take-all, niche differentiation works
- Revenue projection: 1,000–5,000 paying users at $3.99 = $4k–$20k lifetime on near-zero ongoing cost

### v1 Audience
**General habit tracking** — broad appeal, clean neutral branding, universal habit templates.

### v2 Angle (planned, not built yet)
Sports/athletic focus — coaches, athletes, training habits. Preset "athlete packs," team features. The brand name "Forged" naturally extends into this space without a rebrand.

---

## 2. Monetization

**Model:** One-time purchase — no subscription complexity.
**Price:** **$3.99** (one-time unlock)
**IAP Product ID:** `forged_premium_lifetime`
**Platform:** RevenueCat SDK (`react-native-purchases` v8)

### Freemium Gates
| Gate | Free Limit | Premium Unlocks |
|---|---|---|
| Habits | Up to 3 | Unlimited |
| Stats history | 30 days | Full 365 days |
| Heatmap | 30 days | Full year |
| Widgets | Not available | Small + Medium |
| Templates | Not available | 10–15 presets |
| Notes per completion | Not available | Unlocked |
| Data export | Not available | CSV export |
| iCloud sync | Not available | Multi-device |

**Conversion trigger:** Paywall appears naturally when user tries to add their 4th habit — highest-intent moment possible.

**Paywall screen design:** Clean, single price point, widget screenshot as hero image, one CTA button. No pressure, no trials.

---

## 3. Feature Specification

### 3.1 Free Tier Features
- Up to 3 habits
- Daily check-off with satisfying animation + haptics
- Current streak counter (per habit)
- 7-day completion view
- One reminder/notification per habit
- Light / dark / system theme

### 3.2 Premium Features
- Unlimited habits
- Home screen widgets (Small: 1 habit, Medium: 3 habits)
- Full stats dashboard (see Section 3.4)
- 365-day calendar heatmap per habit
- Per-completion notes/journal
- Habit templates (10–15 presets)
- Data export (CSV)
- iCloud sync

### 3.3 Core Check-off Interaction
**This is the soul of the app. Spend disproportionate time here.**

On habit card tap:
1. `expo-haptics` impact feedback (medium weight)
2. Card fills with habit's color — Reanimated 4 CSS animation, 300ms ease-out
3. Streak counter increments with spring number animation
4. If streak milestone (7 / 30 / 100 days): full celebration modal fires

The check-off animation is what gets 5-star reviews saying "so satisfying." It's what people screenshot and share.

### 3.4 Stats Dashboard (Priority Feature)

Three sections:

**Overview Cards (top)**
- 🔥 Longest active streak (across all habits)
- ✅ Perfect days this month (all habits completed)
- 📈 Overall completion rate (last 30 days, %)
- 🏆 All-time longest streak (any habit, ever)

**Per-Habit Breakdown** (scrollable list)
- Current streak / longest ever streak
- 30-day completion sparkline
- Best month
- Total completions all-time

**Heatmap (GitHub-style)**
- 12-month grid, color intensity = habits completed that day
- Tap any day → see which habits were completed
- Free: last 30 days only; Premium: full year

**Weekly Trend Chart**
- Bar chart: completions per day over last 8 weeks
- Overlaid line: 7-day rolling average
- Creates "don't break the graph" motivation

### 3.5 Widgets (Priority Feature — iOS v1, Android v1.1)

**Small widget (1 habit):**
```
┌─────────────────┐
│  🏃 Morning Run  │
│                 │
│    🔥 14        │
│    day streak   │
│                 │
│  ● ● ● ● ● ○ ●  │
│  M T W T F S S  │
└─────────────────┘
```

**Medium widget (3 habits):**
```
┌──────────────────────────────┐
│ Today's Habits          2/3  │
│ ✅ Morning Run    🔥 14 days  │
│ ✅ Read 20 min    🔥 6 days   │
│ ○  Meditate       🔥 3 days  │
└──────────────────────────────┘
```

Widgets are **read-only** in v1. Tapping opens the app to the relevant habit. Widget data updates on every check-off.

### 3.6 Notifications / Reminders (Priority Feature)
- One reminder per habit (configurable time)
- Scheduled via `expo-notifications`
- Reschedule automatically on habit edit
- Cancel on habit delete
- Permission request during onboarding (gentle, with clear value prop)

### 3.7 Onboarding (First Launch Only)
3 screens maximum:
1. Welcome / value prop
2. Create your first habit
3. Enable notifications (with skip option)

### 3.8 Habit Configuration Options
- Name (text)
- Icon (emoji picker)
- Color / theme (color palette)
- Frequency: Daily | Specific days of week | X times per week
- Reminder time
- Category: fitness | nutrition | sleep | mindfulness | focus | recovery | custom

---

## 4. Data Models

```typescript
type Habit = {
  id: string
  name: string
  icon: string           // emoji
  color: string          // hex color
  category: HabitCategory
  frequency: FrequencyConfig
  reminderTime: string | null  // "08:00" 24hr format
  createdAt: Date
  isArchived: boolean
}

type FrequencyConfig =
  | { type: 'daily' }
  | { type: 'daysOfWeek'; days: number[] }   // 0=Sun, 1=Mon, ..., 6=Sat
  | { type: 'xPerWeek'; count: number }       // e.g., "3x per week"

type CompletionLog = {
  id: string
  habitId: string
  completedAt: Date
  note: string | null
}

type HabitCategory =
  'fitness' | 'nutrition' | 'sleep' |
  'mindfulness' | 'focus' | 'recovery' | 'custom'
```

---

## 5. Tech Stack

> **Critical:** This project uses the New Architecture exclusively. Reanimated 4 enforces this and SDK 55 removes Legacy Architecture support entirely.

| Layer | Package | Version | Notes |
|---|---|---|---|
| Framework | `expo` | **SDK 54** → upgrade to **SDK 55** when stable | SDK 55 beta is out now; stable in ~2 weeks |
| React Native | `react-native` | **0.81** | Ships with SDK 54 |
| React | `react` | **19.1** | Ships with SDK 54 |
| Architecture | New Architecture | **Required** | Reanimated 4 enforces this |
| Navigation | `expo-router` | **v4** | File-based routing, ships with SDK 54 |
| Local DB | `expo-sqlite` | SDK 54 stable | New stable API (was `expo-file-system/next`) |
| ORM | `drizzle-orm` + `drizzle-kit` | Latest | Best DX for expo-sqlite |
| State | `zustand` | v5 | Minimal, no boilerplate |
| Animations | `react-native-reanimated` | **v4.x** | CSS animations API — major change from v3 |
| Worklets | `react-native-worklets` | Latest | **New separate peer dep** required by Reanimated 4 |
| Gestures | `react-native-gesture-handler` | v3 | Required with Reanimated 4 |
| Notifications | `expo-notifications` | SDK 54 | Per-habit reminders |
| Haptics | `expo-haptics` | SDK 54 | Critical for check-off feel |
| Widgets | `expo-widgets` + `@expo/ui` | **SDK 55** | No Swift code needed — huge simplification |
| Charts | `victory-native` (XL/Skia) | Latest | Heatmap, sparklines — Skia-based |
| IAP / Paywall | `react-native-purchases` | v8 (RevenueCat) | One-time purchase handling |
| Icons | `@expo/vector-icons` | SDK 54 | Plus emoji for habit icons |
| Dev Build | `expo-dev-client` | SDK 54 | Required — no Expo Go for this stack |
| Build/Deploy | EAS Build + EAS Submit | — | Handles both stores |
| Crash reporting | `@sentry/react-native` | Latest | Sentry + Expo plugin (`@sentry/react-native/expo`) |
| Analytics | `posthog-react-native` | Latest | PostHog — product analytics, funnels, free up to 1M events/mo |

### Reanimated 4 — Critical Migration Notes

**Babel config change (from v3):**
```js
// babel.config.js
module.exports = {
  plugins: [
    'react-native-worklets/plugin', // ← was 'react-native-reanimated/plugin' in v3
  ]
}
```

**Use CSS animations API for state-driven animations** (habit check-off, card fills, number counters):
```typescript
// Reanimated 4 — state-driven animation (new CSS API)
<Animated.View
  style={[
    styles.habitCard,
    {
      animationName: checked ? 'fillIn' : 'fillOut',
      animationDuration: '300ms',
      animationTimingFunction: 'ease-out',
    }
  ]}
/>
```

**Use worklets (shared values) for** gesture-driven interactions and complex orchestrated sequences (milestone celebration modal).

**Deprecated in v4 (removed):** `useAnimatedGestureHandler` — migrate to Gesture Handler v2 `Gesture` API.

### Widget Strategy — `expo-widgets` (SDK 55)

This is a **massive simplification** from any previous approach. No Xcode widget targets, no App Group JSON bridge, no Swift files.

```typescript
// widgets/SingleHabitWidget.tsx
import { Widget } from 'expo-widgets'
import { Text, VStack, HStack } from '@expo/ui/swift-ui'
import { font, foregroundStyle } from '@expo/ui/swift-ui/modifiers'

export function SingleHabitWidget({ habit, streak, weekDays }) {
  return (
    <Widget>
      <VStack>
        <Text style={font('headline')}>{habit.icon} {habit.name}</Text>
        <Text style={foregroundStyle('secondary')}>🔥 {streak} day streak</Text>
        <HStack>
          {weekDays.map(day => (
            <Text key={day.label} style={foregroundStyle(day.completed ? 'primary' : 'tertiary')}>
              {day.completed ? '●' : '○'}
            </Text>
          ))}
        </HStack>
      </VStack>
    </Widget>
  )
}
```

```json
// app.json plugin config
{
  "plugins": [
    ["expo-widgets", {
      "widgets": [
        {
          "name": "SingleHabitWidget",
          "displayName": "Forged — Single Habit",
          "supportedFamilies": ["systemSmall", "systemMedium"]
        }
      ]
    }]
  ]
}
```

**Note:** `expo-widgets` is iOS only as of SDK 55. Android widgets planned for v1.1 using `react-native-android-widget`.

---

## 6. Project File Structure

```
forged/
├── app/                          # Expo Router screens
│   ├── (tabs)/
│   │   ├── index.tsx             # Today view (home tab)
│   │   ├── stats.tsx             # Stats dashboard tab
│   │   └── settings.tsx          # Settings tab
│   ├── habit/
│   │   ├── [id].tsx              # Habit detail screen
│   │   └── new.tsx               # Add new habit
│   ├── habit/edit/[id].tsx       # Edit existing habit
│   ├── onboarding.tsx            # First-launch flow (3 screens)
│   ├── paywall.tsx               # Premium unlock screen
│   └── _layout.tsx               # Root layout + theme provider
│
├── src/
│   ├── db/
│   │   ├── schema.ts             # Drizzle schema (habits, completions)
│   │   ├── migrations/           # Auto-generated by drizzle-kit
│   │   └── client.ts             # DB initialization singleton
│   ├── stores/
│   │   ├── habitsStore.ts        # Zustand: habit CRUD operations
│   │   ├── completionsStore.ts   # Zustand: check-offs, today state
│   │   └── uiStore.ts            # Zustand: modals, toasts, loading
│   ├── utils/
│   │   ├── streak.ts             # ← BUILD AND TEST THIS FIRST
│   │   ├── notifications.ts      # Scheduling helpers
│   │   └── widgetSync.ts         # Sync data snapshot for widgets
│   ├── components/
│   │   ├── HabitCard.tsx         # Core interactive card — most important component
│   │   ├── StreakBadge.tsx        # 🔥 counter with animation
│   │   ├── HeatmapCalendar.tsx   # GitHub-style completion grid
│   │   ├── MilestoneModal.tsx    # 7/30/100 day celebration modal
│   │   ├── Paywall.tsx           # Premium CTA component
│   │   └── ui/                   # Base design system (Button, Card, etc.)
│   └── hooks/
│       ├── useHabitStreak.ts     # Streak calculation hook
│       ├── useCompletionRate.ts  # Rate calculation hook
│       └── usePremium.ts         # RevenueCat status hook
│
├── widgets/                      # expo-widgets (SDK 55)
│   ├── SingleHabitWidget.tsx     # Small: 1 habit
│   └── MultiHabitWidget.tsx      # Medium: 3 habits
│
├── assets/
│   ├── icon.png                  # App icon (appears in widget, home screen, store)
│   ├── splash.png
│   └── adaptive-icon.png         # Android adaptive icon
│
├── drizzle.config.ts
├── app.json
└── eas.json                      # EAS build profiles: development/preview/production
```

---

## 7. Streak Engine — First Thing to Build

Write `src/utils/streak.ts` as pure TypeScript with full unit tests **before any UI work**. This is the core logic of the entire app and has real edge cases.

### Functions Required

```typescript
// src/utils/streak.ts

type FrequencyConfig =
  | { type: 'daily' }
  | { type: 'daysOfWeek'; days: number[] }   // 0=Sun, 1=Mon...
  | { type: 'xPerWeek'; count: number }

export function calculateCurrentStreak(
  completions: Date[],
  frequency: FrequencyConfig,
  today: Date
): number

export function calculateLongestStreak(
  completions: Date[],
  frequency: FrequencyConfig
): number

export function isStreakAtRisk(
  lastCompletion: Date | null,
  frequency: FrequencyConfig,
  now: Date
): boolean  // True if scheduled today and not yet completed

export function getCompletionRate(
  completions: Date[],
  frequency: FrequencyConfig,
  windowDays: number  // 7, 30, or 90
): number  // 0.0 to 1.0

export function getScheduledDaysInWindow(
  frequency: FrequencyConfig,
  startDate: Date,
  endDate: Date
): Date[]  // All "expected" completion dates for heatmap rendering

export function isScheduledDay(
  date: Date,
  frequency: FrequencyConfig
): boolean
```

### Edge Cases to Test (minimum 20 unit tests)
- Daily streaks with no gaps
- Daily streaks with one gap (streak resets)
- Skipped non-scheduled days (should NOT break streak for daysOfWeek frequency)
- xPerWeek: completed 3x in a week = full week credit
- xPerWeek: completed 2/3 in a week = streak breaks
- Timezone midnight edge cases (user in different timezone)
- Completion logged at 11:59 PM vs 12:01 AM
- First-ever completion (streak = 1)
- Streak after a long break (comeback)
- Leap year February handling
- Longest streak calculation across multiple broken streaks
- "At risk" flag: scheduled today, not completed, after reminder time
- "At risk" flag: not scheduled today (should be false)

---

## 8. Screen Map

```
App
├── Onboarding (first launch only)
│   ├── Welcome / value prop
│   ├── Create your first habit
│   └── Enable notifications (skippable)
│
├── Today View (Home Tab)
│   ├── Date header + overall completion summary
│   ├── Habit cards list (check off daily)
│   └── Completion animation / milestone celebration
│
├── Habit Detail
│   ├── Streak counter (current + longest ever)
│   ├── 365-day calendar heatmap
│   ├── Completion rate (last 30 / 90 days)
│   └── Notes log (per-completion, premium)
│
├── Add / Edit Habit
│   ├── Name + icon (emoji picker)
│   ├── Color / theme selector
│   ├── Frequency (daily / specific days / X per week)
│   ├── Reminder time
│   └── Category
│
├── Stats Dashboard (Stats Tab)
│   ├── Overview cards (streak, perfect days, completion %)
│   ├── Per-habit breakdown with sparklines
│   ├── 12-month heatmap
│   └── Weekly trend bar chart
│
├── Settings Tab
│   ├── Notification preferences
│   ├── Theme (light/dark/system)
│   ├── Week start day (Sun/Mon)
│   ├── Premium unlock / manage purchase
│   └── Data export
│
└── Paywall Screen (triggered on 4th habit attempt)
    └── Widget hero screenshot + single $3.99 CTA
```

---

## 9. Build Phases & Timeline

**Target:** Live in both App Stores in ~30 days from first commit.

### Phase 1 — Core Loop (Days 1–5)
- Expo project scaffold (SDK 54, New Architecture enabled)
- Drizzle schema + migrations
- Zustand stores
- `streak.ts` with full unit test suite
- Today view + habit card list
- **HabitCard check-off interaction** (spend 2 full days here)
  - Haptic feedback
  - Reanimated 4 CSS fill animation
  - Streak counter spring animation
  - Milestone modal (7/30/100 days)
- Add/Edit habit screen

### Phase 2 — Priority Features (Days 6–12)
- **Sentry crash reporting**: install `@sentry/react-native`, add Expo plugin, configure DSN via env var
- `expo-notifications`: per-habit scheduling, reschedule on edit, cancel on delete
- Stats dashboard: overview cards, per-habit sparklines, heatmap component
- Habit detail screen
- Onboarding flow (3 screens)
- Light/dark/system theme

### Phase 3 — Widgets + Monetization (Days 13–19)
- **Upgrade to SDK 55** (stable by this point)
- `expo-widgets` setup: small + medium widget
- `widgetSync.ts`: update snapshot on every check-off
- RevenueCat SDK integration
- Freemium gates implementation
- Paywall screen
- Habit template presets (10–15)
- **PostHog analytics**: install `posthog-react-native`, wire key events (see Section 14)

### Phase 4 — Polish + Submission (Days 20–30)
- App icon design (shows in widget, home screen, store — invest here)
- Empty states, error states, loading skeletons
- EAS build profiles configured
- Privacy policy (required for both stores)
- App Store Connect screenshots: 6.7", 6.1", iPad 12.9"
- Google Play Console: feature graphic + screenshots
- TestFlight internal testing on real devices
- Submit both stores simultaneously

---

## 10. Key Technical Decisions & Rationale

| Decision | Choice | Reason |
|---|---|---|
| Expo workflow | Managed (with SDK 55 plugins) | `expo-widgets` in SDK 55 removes need for bare workflow — huge win |
| Architecture | New Architecture only | Reanimated 4 requires it; SDK 55 removes legacy entirely |
| Widget approach | `expo-widgets` (SDK 55) | No Swift, no Xcode targets, no App Group bridge — massive simplification |
| ORM | Drizzle | Best DX for expo-sqlite, type-safe, fast |
| Animation library | Reanimated 4 CSS API | Less boilerplate for state-driven animations; worklets for complex gestures |
| State management | Zustand | Minimal boilerplate, works well with SQLite as source of truth |
| Monetization | RevenueCat | Handles both stores, receipt validation, analytics |
| Monetization model | One-time purchase | No subscription friction; clean UX for sub-$5 app |
| Widget platforms | iOS v1, Android v1.1 | `expo-widgets` is iOS-only; Android via community lib later |

---

## 11. Risks & Mitigations

| Risk | Likelihood | Mitigation |
|---|---|---|
| SDK 55 takes longer to go stable | Low | Build Phase 1–2 on SDK 54; widgets aren't needed until Phase 3 |
| Streak logic bugs (timezone edge cases) | Medium | Full unit test suite before any UI — pure logic is easy to test |
| App Store review rejection | Low | Habit apps are well-understood category; follow guidelines early |
| Widget UX disappoints (iOS only in v1) | Low | Set expectation in marketing; Android ships in v1.1 |
| "Just another habit app" discovery problem | Medium | Strong screenshots of check-off animation + widget; early review velocity matters most |
| RevenueCat IAP sandbox issues | Low-Medium | Test on real devices in TestFlight with sandbox accounts |

---

## 12. App Store Metadata

**App Name:** Forged
**Subtitle:** Build habits that stick
**Category Primary:** Health & Fitness
**Category Secondary:** Productivity
**Price:** $3.99 (one-time)

**Suggested Keywords (iOS):**
habit, streak, tracker, daily routine, goals, consistency, discipline, chain, builder, coach

**Short Description (Google Play):**
Build powerful habits through streaks. Track daily goals, never break the chain, and watch your consistency grow.

---

## 13. Observability — Crash Reporting & Analytics

### Crash Reporting — Sentry

**Package:** `@sentry/react-native` + Expo config plugin `@sentry/react-native/expo`

**Why Sentry:** Best-in-class React Native support; source maps upload automatically via EAS; breadcrumbs give full context leading up to a crash; free tier covers 5,000 errors/month easily.

**Setup:**
```ts
// app/_layout.tsx
import * as Sentry from '@sentry/react-native'

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  environment: __DEV__ ? 'development' : 'production',
  tracesSampleRate: 0.2,   // 20% performance traces in prod
  enableAutoSessionTracking: true,
})
```

**app.json plugin config:**
```json
["@sentry/react-native/expo", { "organization": "...", "project": "forged" }]
```

**Env vars:**
- `EXPO_PUBLIC_SENTRY_DSN` — public, safe to commit to EAS env

---

### Analytics — PostHog

**Package:** `posthog-react-native`

**Why PostHog:** Open source; generous free tier (1M events/month); product analytics focus (funnels, retention, feature flags); no sampling on free tier; self-hostable if needed later.

**Key events to track:**

| Event | Properties | Phase |
|---|---|---|
| `habit_created` | `{ category, frequency_type, has_reminder }` | Core loop |
| `habit_completed` | `{ habit_id, streak_length, completion_count }` | Core loop |
| `streak_milestone` | `{ days: 7 \| 30 \| 100, habit_id }` | Core loop |
| `paywall_viewed` | `{ trigger: '4th_habit' \| 'stats' \| 'widget' \| 'export' }` | Monetization |
| `purchase_completed` | `{ product_id, price }` | Monetization |
| `purchase_cancelled` | `{ trigger }` | Monetization |
| `habit_deleted` | `{ streak_length, days_tracked }` | Retention signal |
| `notification_enabled` | `{ context: 'onboarding' \| 'settings' }` | Engagement |
| `widget_configured` | `{ size: 'small' \| 'medium' }` | Engagement |
| `app_opened` | (auto) | Retention |

**What to answer with this data:**
- What % of users who see the paywall convert? (optimize the CTA)
- Which habit categories are most popular? (inform templates)
- At what streak length do users churn? (inform milestone modal timing)
- Do notification users retain better? (gate or push harder during onboarding)

**Setup:**
```ts
// src/analytics/posthog.ts
import PostHog from 'posthog-react-native'

export const posthog = new PostHog(process.env.EXPO_PUBLIC_POSTHOG_API_KEY!, {
  host: 'https://us.i.posthog.com',
  disabled: __DEV__,    // silence events during development
})
```

**Env vars:**
- `EXPO_PUBLIC_POSTHOG_API_KEY` — public (client-side key, write-only)

---

### Privacy considerations
- No PII is collected — all events use anonymous device IDs
- Sentry: enable `beforeSend` to scrub any accidental PII from error payloads
- PostHog: disable session recording (not needed; habit names could be sensitive)
- Add to privacy policy: "We use Sentry for crash diagnostics and PostHog for aggregated, anonymous usage analytics"

---

## 14. Future v2 Ideas (Do Not Build in v1)

- Sports/athletic angle: preset "athlete packs" (Strength, Running, Recovery, Nutrition)
- Coach mode: create habit plans for a team/group
- Apple Health / Google Fit integration (sync workouts as completions)
- Android home screen widgets
- Apple Watch companion (glanceable streak, tap to complete)
- Shared challenges / accountability partner
- Habit difficulty/XP system (RPG-lite progression)

---

*Document generated from planning session. Last updated: February 2026.*
