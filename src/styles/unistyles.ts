import { StyleSheet } from 'react-native-unistyles'
import { lightTheme, darkTheme } from './themes'

StyleSheet.configure({
  themes: {
    light: lightTheme,
    dark:  darkTheme,
  },
  settings: {
    // Automatically mirrors the device's appearance (light/dark) setting.
    // Consumers can call UnistylesRuntime.setAdaptiveThemes(false) and
    // UnistylesRuntime.setTheme('light' | 'dark') for a manual override.
    adaptiveThemes: true,
  },
})
