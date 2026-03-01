import { Pressable as RNPressable } from 'react-native'
import type { PressableProps } from 'react-native'

// PostHog autocapture uses `ph-label` to identify interactive elements.
type Props = PressableProps & { 'ph-label'?: string }

/**
 * Drop-in replacement for React Native's Pressable.
 * Automatically applies opacity feedback on press so every touchable
 * in the app has consistent visual feedback without per-callsite boilerplate.
 *
 * Usage: import { Pressable } from '@/components/Pressable' — same API as RN's Pressable.
 * Pass `ph-label="my_action"` to give PostHog autocapture a semantic label.
 */
export function Pressable({ style, ...props }: Props) {
  return (
    <RNPressable
      style={(state) => {
        const base = typeof style === 'function' ? style(state) : style
        return state.pressed ? [base, PRESSED] : base
      }}
      {...props}
    />
  )
}

const PRESSED = { opacity: 0.72 } as const
