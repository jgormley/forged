import { View } from 'react-native'
import type { StyleProp, ViewStyle } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

interface ScreenHeaderProps {
  style?: StyleProp<ViewStyle>
  children: React.ReactNode
}

export function ScreenHeader({ style, children }: ScreenHeaderProps) {
  return (
    <View style={[styles.header, style]}>
      {children}
      <View style={styles.heroCap} />
    </View>
  )
}

const styles = StyleSheet.create((theme, rt) => ({
  header: {
    paddingTop: rt.insets.top + theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.xxl,
    overflow: 'visible',
  },
  heroCap: {
    position: 'absolute',
    bottom: -(rt.screen.width * 2 - 40),
    left: 0,
    width: rt.screen.width,
    height: rt.screen.width * 2,
    borderRadius: rt.screen.width,
    backgroundColor: theme.colors.surface,
    transform: [{ scaleX: 2.5 }],
  },
}))
