# Forged

A React Native habit tracker for iOS and Android. Core mechanic: streaks. Monetisation: $3.99 one-time purchase.

- **Bundle ID / Package:** `com.forgedapp.forged`
- **Framework:** Expo SDK 55, React Native 0.83, React 19, New Architecture
- **Navigation:** expo-router v4 (file-based)
- **Styling:** react-native-unistyles v3
- **Database:** expo-sqlite + drizzle-orm
- **IAP:** RevenueCat (`react-native-purchases` v9)
- **Analytics:** PostHog
- **Crash reporting:** Sentry

---

## Prerequisites

- Node.js 20+
- Xcode 16+ (for iOS)
- Android Studio (for Android)
- EAS CLI: `npm install -g eas-cli`
- Expo CLI: `npm install -g expo-cli`

---

## Running Locally

### 1. Install dependencies

```bash
npm install --legacy-peer-deps
```

### 2. Set up environment variables

Create a `.env.local` file in the project root (never commit this):

```
EXPO_PUBLIC_SENTRY_DSN=...
EXPO_PUBLIC_POSTHOG_API_KEY=...
EXPO_PUBLIC_RC_API_KEY_IOS=...
EXPO_PUBLIC_RC_API_KEY_ANDROID=...
```

### 3. Generate the native projects

`ios/` and `android/` are gitignored and must be generated before the first run, or after any `app.json` plugin change:

```bash
npx expo prebuild --clean
```

### 4. Run on device / simulator

```bash
# iOS
npx expo run:ios

# Android
npx expo run:android
```

### Running tests

```bash
npm test
```

Streak engine unit tests (38 tests, no React Native dependencies):

```bash
npm test -- --testPathPattern=streak
```

### Database migrations

If you change `src/db/schema.ts`, regenerate the migration:

```bash
npm run db:generate
```

Migrations run automatically on app launch via `useMigrations()` in `app/_layout.tsx`.

---

## Environment Variables

| Variable | Used for |
|---|---|
| `EXPO_PUBLIC_SENTRY_DSN` | Sentry crash reporting |
| `EXPO_PUBLIC_POSTHOG_API_KEY` | PostHog analytics |
| `EXPO_PUBLIC_RC_API_KEY_IOS` | RevenueCat iOS IAP |
| `EXPO_PUBLIC_RC_API_KEY_ANDROID` | RevenueCat Android IAP |

EAS environment variables are managed via the EAS dashboard and are set for both `preview` and `production` profiles.

---

## Testing In-App Purchases Locally

StoreKit sandbox on local dev builds requires the App Store Connect Paid Applications agreement to be active and tax forms submitted. After signing agreements, allow **2–4 hours** for Apple's servers to propagate before sandbox purchases work.

For faster local IAP testing, use a **StoreKit Configuration File**:

1. Run `npx expo prebuild` to generate `ios/`
2. Open `ios/forged.xcworkspace` in Xcode
3. **File → New → File → StoreKit Configuration File** → name it `Forged.storekit`
4. Add a Non-Consumable product with ID `com.forgedapp.forged.premium_lifetime`
5. **Product → Scheme → Edit Scheme → Run → Options → StoreKit Configuration** → select `Forged.storekit`
6. Run from Xcode — purchases are handled locally, no Apple servers required

---

## Deploying to TestFlight & Google Play Internal Testing

Uses EAS Build with the `production` profile. Build numbers are auto-incremented by EAS (`appVersionSource: remote`).

### Build + submit both platforms

```bash
eas build --profile production --platform all --auto-submit
```

### iOS only → TestFlight

```bash
eas build --profile production --platform ios --auto-submit
```

### Android only → Google Play internal testing

```bash
eas build --profile production --platform android --auto-submit
```

The `--auto-submit` flag uses the submit config in `eas.json` to push directly to TestFlight (iOS) and the Google Play internal testing track (Android) after the build completes.

---

## Deploying to Production (App Stores)

### Before submitting

- [ ] Remove `releaseStatus: "draft"` from the Android submit config in `eas.json` (required to publish beyond internal testing in Google Play)
- [ ] Complete Play Store listing (description, screenshots, feature graphic)
- [ ] Add App Store screenshots (6.7", 6.1", iPad 12.9")
- [ ] Review App Store metadata in `forged-project-context.md` Section 12

### Build + submit for production

Same command as above — the `production` EAS profile handles both stores:

```bash
eas build --profile production --platform all --auto-submit
```

After the build, App Store submission requires manual review approval in App Store Connect. Google Play can be promoted from internal → production track in the Play Console.

---

## Project Structure

```
app/                    # expo-router screens
  (tabs)/               # main tab navigator (Today / Progress / Settings)
  habit/                # habit CRUD screens (new, edit)
  onboarding.tsx
  paywall.tsx
  legal/[slug].tsx
  debug.tsx

src/
  analytics/            # PostHog singleton
  components/           # shared UI components
  content/              # legal text (Privacy Policy, Terms)
  db/                   # Drizzle schema, client, migrations
  hooks/                # usePremium (RevenueCat)
  stores/               # Zustand stores (habits, completions, ui, notifications)
  styles/               # Unistyles themes + config
  utils/                # streak engine, notifications, onboarding presets

docs/                   # GitHub Pages (Privacy Policy + Terms of Service)
assets/                 # icons, images
```

---

## Key Technical Notes

- **Unistyles v3:** `root: 'src'` in `babel.config.js` — NOT `'.'` (causes startup crash). `useStyles` does not exist in v3; use `useUnistyles()` for inline theme access.
- **Reanimated 4:** Worklets plugin is `react-native-worklets/plugin` — NOT `react-native-reanimated/plugin`.
- **Zustand:** Always select primitive values individually — never return objects from selectors (causes infinite re-render).
- **CNG:** `ios/` and `android/` are gitignored. Regenerate with `npx expo prebuild --clean`. After any native module install, rebuild with `npx expo run:ios`.
- **npm:** Always use `npm install --legacy-peer-deps` for third-party packages.

---

## Legal

- Privacy Policy: https://jgormley.github.io/forged/privacy/
- Terms of Service: https://jgormley.github.io/forged/terms/
