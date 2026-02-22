import { View, Text, Pressable } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs'
import { TodayIcon, ProgressIcon, ForgeIcon, SettingsIcon } from '@/components/icons/TabIcons'

const TABS = [
  { name: 'index',    label: 'Today',    Icon: TodayIcon    },
  { name: 'progress', label: 'Progress', Icon: ProgressIcon },
  { name: 'forge',    label: 'Forge',    Icon: ForgeIcon    },
  { name: 'settings', label: 'Settings', Icon: SettingsIcon },
] as const

export function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  // useUnistyles needed here because icon/label color depends on runtime state (focused)
  const { theme, rt } = useUnistyles()

  return (
    <View style={[styles.container, { paddingBottom: Math.max(rt.insets.bottom, theme.spacing.sm) }]}>
      {TABS.map(({ name, label, Icon }) => {
        const routeIndex = state.routes.findIndex((r) => r.name === name)
        const focused = state.index === routeIndex
        const color = focused ? theme.colors.success : theme.colors.textTertiary

        return (
          <Pressable
            key={name}
            style={styles.tab}
            onPress={() => navigation.navigate(name)}
            hitSlop={8}
          >
            <Icon color={color} size={24} />
            <Text style={[styles.label, { color }]}>{label}</Text>
          </Pressable>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flexDirection: 'row',
    backgroundColor: theme.colors.tabBar,
    borderTopWidth: 1,
    borderTopColor: theme.colors.tabBarBorder,
    paddingTop: theme.spacing.sm,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  label: {
    fontFamily: theme.font.family.bodySemiBold,
    fontSize: 9,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
}))
