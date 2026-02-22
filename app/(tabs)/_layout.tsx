import { Tabs } from 'expo-router'
import { CustomTabBar } from '@/components/navigation/CustomTabBar'

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="progress" />
      <Tabs.Screen name="settings" />
    </Tabs>
  )
}
