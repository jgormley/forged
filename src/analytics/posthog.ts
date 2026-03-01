import PostHog from 'posthog-react-native'

const POSTHOG_API_KEY = process.env.EXPO_PUBLIC_POSTHOG_API_KEY ?? ''

export const posthog = new PostHog(POSTHOG_API_KEY, {
  host: 'https://us.i.posthog.com',
  disabled: !POSTHOG_API_KEY,
})

if (__DEV__) posthog.debug()
