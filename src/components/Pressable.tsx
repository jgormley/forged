import { Pressable as RNPressable } from 'react-native'
import type { PressableProps } from 'react-native'

/**
 * Drop-in replacement for React Native's Pressable.
 * Automatically applies opacity feedback on press so every touchable
 * in the app has consistent visual feedback without per-callsite boilerplate.
 *
 * Usage: import { Pressable } from '@/components/Pressable' — same API as RN's Pressable.
 */
export function Pressable({ style, ...props }: PressableProps) {
  return (
    <RNPressable
      style={({ pressed }) => {
        const base = typeof style === 'function' ? style({ pressed }) : style
        return pressed ? [base, PRESSED] : base
      }}
      {...props}
    />
  )
}

const PRESSED = { opacity: 0.72 } as const
