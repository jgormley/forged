<!--
Sync Impact Report
- Version change: 0.0.0 → 1.0.0 (initial ratification)
- Added principles: I. Design System Compliance, II. Separation of Concerns,
  III. CNG & Native Safety, IV. Simplicity & Minimalism, V. Offline-First
- Added sections: Technology Constraints, Development Workflow
- Templates requiring updates: N/A (initial constitution, templates are generic)
- Follow-up TODOs: None
-->

# Forged Constitution

## Core Principles

### I. Design System Compliance

All UI code MUST use the Unistyles v3 design system. This is non-negotiable.

- Import `StyleSheet` from `react-native-unistyles`, NEVER from `react-native`
- NEVER hardcode colors, spacing, radius, or font family strings — always
  reference `theme.colors.*`, `theme.spacing.*`, `theme.radius.*`,
  `theme.font.family.*`
- Define styles with `StyleSheet.create((theme) => (...))` at module scope
- Use `useUnistyles()` for inline theme access (NOT `useStyles` — it does
  not exist in Unistyles v3)
- Dark mode is handled automatically via `adaptiveThemes: true` — NEVER
  use `useColorScheme()` from React Native
- Use Unistyles variants for conditional styling (card states, button sizes)

**Rationale**: Consistent theming, automatic dark mode, and a single source
of truth for visual tokens. Hardcoded values break theme switching and make
the design system unmaintainable.

### II. Separation of Concerns

Business logic MUST be separated from UI components.

- Streak calculations belong in `src/utils/streak.ts` (pure TS, no RN
  imports) — NEVER in components
- State management lives in Zustand stores (`src/stores/`) — import hooks
  directly, no React Context wrapping
- Zustand selectors MUST return primitive values individually — NEVER
  return objects (causes infinite re-renders from new references)
- Database queries use Drizzle ORM with `useLiveQuery` for reactivity
- Navigation uses expo-router hooks only — NEVER import from
  `@react-navigation/*` directly

**Rationale**: Pure logic is independently testable. Keeping state out of
components prevents coupling and makes the codebase easier to reason about.

### III. CNG & Native Safety

The project uses Continuous Native Generation. Native directories are
ephemeral and MUST NOT be committed.

- `ios/` and `android/` are gitignored — NEVER commit them
- Regenerate with `npx expo prebuild --clean` after any `app.json` plugin
  change
- After installing a native module, rebuild with `npx expo run:ios`
- Use `npx expo install <pkg>` for Expo SDK packages (ensures pinned
  compatible versions)
- The Babel plugin for animations is `react-native-worklets/plugin` —
  NEVER use `react-native-reanimated/plugin` (Reanimated 4 change)

**Rationale**: CNG ensures reproducible native builds from declarative
config. Committing generated native code creates merge conflicts and
drift from the source of truth in `app.json`.

### IV. Simplicity & Minimalism

Every change MUST be the minimum required to solve the problem.

- NEVER add features, refactoring, or "improvements" beyond what was
  requested
- Do not add error handling for scenarios that cannot happen — trust
  internal code and framework guarantees
- Do not create abstractions for one-time operations — three similar
  lines are better than a premature abstraction
- Do not add comments, docstrings, or type annotations to unchanged code
- Avoid backwards-compatibility hacks — if something is unused, delete it

**Rationale**: Over-engineering creates maintenance burden without
delivering user value. The right amount of complexity is the minimum
needed for the current task.

### V. Offline-First & Local Data

All user data MUST be stored locally on-device. The app has no backend.

- Database: expo-sqlite with Drizzle ORM, schema in `src/db/schema.ts`
- Migrations are auto-generated (`npm run db:generate`) and run on app
  launch via `useMigrations()`
- `FrequencyConfig` type is single-sourced in `src/utils/streak.ts` and
  re-exported from schema
- Monetisation state comes from RevenueCat (entitlement:
  `forged_premium_lifetime`), not a local flag
- Free tier: max 3 habits (`FREE_HABIT_LIMIT = 3`)

**Rationale**: Local-first means zero latency, full offline support, and
no server costs. User data never leaves the device, which simplifies
privacy compliance.

## Technology Constraints

- **Framework**: Expo SDK 55, React Native 0.83, React 19, New Architecture
  (mandatory)
- **Language**: TypeScript (strict mode for tests, standard for app code)
- **Routing**: expo-router v4 (file-based), screens in `app/`
- **Styling**: react-native-unistyles v3 (`root: 'src'` in babel.config.js)
- **Animations**: react-native-reanimated v4 + react-native-worklets
- **State**: Zustand v5
- **Database**: expo-sqlite + drizzle-orm
- **IAP**: react-native-purchases v9 (RevenueCat)
- **Analytics**: posthog-react-native
- **Crash Reporting**: @sentry/react-native
- **Testing**: Jest + ts-jest (unit tests for pure logic in
  `src/utils/**/*.test.ts`)
- **Target**: iOS and Android (phone-first, tablet secondary)
- **Deployment**: EAS Build → App Store / Google Play, EAS Update for OTA

## Development Workflow

- **Commits**: NEVER auto-commit or auto-push. Wait for explicit user
  approval before committing or pushing.
- **Build progress**: `PROGRESS.md` is the source of truth for build
  status and next steps — keep it updated after completing features.
- **Version bumps**: Run `npm run version:bump` before each production
  EAS build to increment the patch version in `app.json` and
  `package.json`.
- **Dependencies**: Use `npm install` (no flags needed as of SDK 55).
  Use `npx expo install` for Expo SDK packages.
- **Testing**: Run `npm test` before committing changes that touch
  streak logic or utility functions.

## Governance

This constitution defines the non-negotiable rules for the Forged
codebase. All feature specs, implementation plans, and code changes
MUST comply with these principles.

- **Amendments**: Update this file when project conventions change
  (e.g., SDK upgrade, new architectural pattern). Increment the version
  per semver: MAJOR for principle removals/redefinitions, MINOR for new
  principles, PATCH for clarifications.
- **Compliance**: Every spec and plan produced by spec-kit MUST include
  a constitution check verifying alignment with these principles.
- **Runtime guidance**: See `CLAUDE.md` for detailed design tokens,
  color references, and code examples.

**Version**: 1.0.0 | **Ratified**: 2026-03-14 | **Last Amended**: 2026-03-14
