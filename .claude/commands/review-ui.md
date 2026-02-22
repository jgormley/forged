# /review-ui

Review one or more UI files for design system compliance.

## Usage

```
/review-ui [file-or-glob]
```

If no argument is given, review all recently modified `.tsx` / `.ts` files in `src/components/` and `app/`.

---

## What to check

For each file provided, audit against these rules from `CLAUDE.md`:

### 1. StyleSheet import source
- **FAIL** if `StyleSheet` is imported from `react-native`
- **PASS** only if imported from `react-native-unistyles`

### 2. `useStyles()` hook usage
- **FAIL** if inline styles are built without `useStyles(stylesheet)` (e.g. raw objects passed to `style` props)
- **PASS** if all dynamic styling flows through `useStyles`

### 3. Hardcoded colors
- **FAIL** if any hex color string (`#…`), `rgb(…)`, `rgba(…)`, or named color appears in a StyleSheet or inline `style` prop — EXCEPT values inside `src/styles/themes.ts`
- **PASS** if all color references use `theme.colors.*`

### 4. Hardcoded font families
- **FAIL** if a `fontFamily` value is a raw string literal (e.g. `'CormorantUpright_700Bold'`) rather than `theme.font.family.*`
- **PASS** if all font families reference a theme token

### 5. Hardcoded spacing / radius
- **FAIL** if any raw numeric pixel value is used for `padding`, `margin`, `gap`, `borderRadius`, `width`, `height` when a design token exists for it
- **PASS** if all spacing uses `theme.spacing.*` and radii use `theme.radius.*`
  - Allowed exceptions: `flex: 1`, `0` (zero), percentage strings, line-relative values

### 6. Variant usage
- **WARN** if a component uses ternary expressions inside a StyleSheet to switch colors/sizes based on props — suggest converting to Unistyles `variants` instead

### 6. Shadow tokens
- **FAIL** if shadow properties are defined inline rather than spreading `theme.shadow.sm / .md / .lg`

### 7. Dark mode handling
- **FAIL** if `useColorScheme()` from `react-native` or `@react-navigation` is used — Unistyles handles this automatically

### 8. Animation correctness
- **WARN** if `StyleSheet` from `react-native` is used alongside Reanimated (incompatible with Unistyles theme tracking)

---

## Output format

For each file, output a table:

| Check | Status | Details |
|---|---|---|
| StyleSheet import | ✅ PASS / ❌ FAIL | … |
| useStyles hook | ✅ / ❌ | … |
| Hardcoded colors | ✅ / ❌ / ⚠️ WARN | … |
| Hardcoded spacing | ✅ / ❌ | … |
| Variants | ✅ / ⚠️ | … |
| Shadow tokens | ✅ / ❌ | … |
| Dark mode | ✅ / ❌ | … |
| Animation compat | ✅ / ⚠️ | … |

Then list any specific line numbers that need fixing, with a one-line fix suggestion each.

Finally, give an **Overall** rating: ✅ Compliant / ⚠️ Needs minor fixes / ❌ Non-compliant.
