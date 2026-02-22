import { Tabs } from 'expo-router'
import { useColorScheme } from 'react-native'

export default function TabLayout() {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#FF6B35',
        tabBarInactiveTintColor: isDark ? '#555' : '#999',
        tabBarStyle: {
          backgroundColor: isDark ? '#0a0a0a' : '#fff',
          borderTopColor: isDark ? '#1a1a1a' : '#f0f0f0',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Today', tabBarIcon: () => null }}
      />
      <Tabs.Screen
        name="stats"
        options={{ title: 'Stats', tabBarIcon: () => null }}
      />
      <Tabs.Screen
        name="settings"
        options={{ title: 'Settings', tabBarIcon: () => null }}
      />
    </Tabs>
  )
}
