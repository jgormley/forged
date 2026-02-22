import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useColorScheme } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'

export default function RootLayout() {
  const colorScheme = useColorScheme()

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="paywall" options={{ presentation: 'modal' }} />
        <Stack.Screen name="habit/new" options={{ presentation: 'modal' }} />
        <Stack.Screen name="habit/[id]" />
        <Stack.Screen name="habit/edit/[id]" options={{ presentation: 'modal' }} />
      </Stack>
    </GestureHandlerRootView>
  )
}
