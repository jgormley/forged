import * as Sentry from '@sentry/react-native'
import { useEffect } from 'react'
import { Stack, router } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { UnistylesRuntime } from 'react-native-unistyles'
import { useNotificationSettingsStore } from '@/stores/notificationSettingsStore'
import { StatusBar } from 'expo-status-bar'
import { View, ActivityIndicator, Text } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import * as SplashScreen from 'expo-splash-screen'
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator'
import { db } from '@/db/client'
import migrations from '@/db/migrations/migrations'

import { MilestoneModal } from '@/components/MilestoneModal'
import {
  CormorantUpright_400Regular,
  CormorantUpright_600SemiBold,
  CormorantUpright_700Bold,
} from '@expo-google-fonts/cormorant-upright'
import {
  Cormorant_400Regular_Italic,
  Cormorant_600SemiBold_Italic,
} from '@expo-google-fonts/cormorant'
import {
  CrimsonPro_400Regular,
  CrimsonPro_500Medium,
  CrimsonPro_600SemiBold,
  CrimsonPro_700Bold,
} from '@expo-google-fonts/crimson-pro'
import { useFonts } from 'expo-font'

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  debug: true,
  enabled: true,
  tracesSampleRate: 1,
  profilesSampleRate: 1,
})

// Hold the splash until fonts + DB migration are both ready.
SplashScreen.preventAutoHideAsync()

function RootLayout() {
  const { success: dbReady, error: dbError } = useMigrations(db, migrations)

  const [fontsLoaded, fontError] = useFonts({
    CormorantUpright_400Regular,
    CormorantUpright_600SemiBold,
    CormorantUpright_700Bold,
    Cormorant_400Regular_Italic,
    Cormorant_600SemiBold_Italic,
    CrimsonPro_400Regular,
    CrimsonPro_500Medium,
    CrimsonPro_600SemiBold,
    CrimsonPro_700Bold,
  })

  const ready = dbReady && fontsLoaded

  // Load persisted settings as early as possible.
  useEffect(() => {
    useNotificationSettingsStore.getState().load()
  }, [])

  // Restore theme preference as early as possible (before first paint).
  useEffect(() => {
    AsyncStorage.getItem('@forged/theme').then((value) => {
      if (value === 'light') {
        UnistylesRuntime.setAdaptiveThemes(false)
        UnistylesRuntime.setTheme('light')
      } else if (value === 'dark') {
        UnistylesRuntime.setAdaptiveThemes(false)
        UnistylesRuntime.setTheme('dark')
      }
      // 'system' or null → leave adaptiveThemes: true (config default)
    })
  }, [])

  useEffect(() => {
    if (ready || dbError || fontError) {
      SplashScreen.hideAsync()
    }
  }, [ready, dbError, fontError])

  useEffect(() => {
    if (!ready) return
    AsyncStorage.getItem('@forged/onboardingComplete').then((value) => {
      if (!value) router.replace('/onboarding')
    })
  }, [ready])

  if (dbError) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#12100C' }}>
        <Text style={{ color: '#C05050', fontFamily: 'System' }}>
          Database error: {dbError.message}
        </Text>
      </View>
    )
  }

  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#12100C' }}>
        <ActivityIndicator color="#C8A84B" />
      </View>
    )
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="paywall" options={{ presentation: 'modal' }} />
        <Stack.Screen name="habit/new" options={{ presentation: 'modal' }} />
        <Stack.Screen name="habit/[id]" />
        <Stack.Screen name="habit/edit/[id]" options={{ presentation: 'modal' }} />
        <Stack.Screen name="legal/[slug]" options={{ presentation: 'modal' }} />
        <Stack.Screen name="debug" options={{ presentation: 'modal' }} />
      </Stack>
      <MilestoneModal />
    </GestureHandlerRootView>
  )
}

export default Sentry.wrap(RootLayout)
