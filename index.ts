// Initialise Unistyles (design system) before the router boots.
// This import has side-effects (StyleSheet.configure) — order matters.
import './src/styles/unistyles'

import 'expo-router/entry'
