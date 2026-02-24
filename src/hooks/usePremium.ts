import { useState, useEffect, useCallback } from 'react'
import { Platform } from 'react-native'
import Purchases, { type CustomerInfo } from 'react-native-purchases'

const ENTITLEMENT_ID = 'forged_premium_lifetime'
export const FREE_HABIT_LIMIT = 3

const RC_API_KEY_IOS = process.env.EXPO_PUBLIC_RC_API_KEY_IOS ?? ''
const RC_API_KEY_ANDROID = process.env.EXPO_PUBLIC_RC_API_KEY_ANDROID ?? ''

let rcConfigured = false

// Call this once at app startup (module scope in _layout.tsx).
export function configureRevenueCat() {
  if (rcConfigured) return
  const key = Platform.OS === 'ios' ? RC_API_KEY_IOS : RC_API_KEY_ANDROID
  if (!key) return // Keys not yet set — skip silently
  Purchases.configure({ apiKey: key })
  rcConfigured = true
}

function isPremiumFromInfo(info: CustomerInfo): boolean {
  return info.entitlements.active[ENTITLEMENT_ID] !== undefined
}

// ---------------------------------------------------------------------------

interface PremiumState {
  isPremium: boolean
  isLoading: boolean
  /** Returns true if the purchase succeeded */
  purchase: () => Promise<boolean>
  /** Returns true if a premium purchase was found and restored */
  restore: () => Promise<boolean>
  /** Re-check entitlement status (call after toggling paywall) */
  refresh: () => Promise<void>
  /** Whether the user can add another habit (free tier: max 3) */
  canAddHabit: (currentHabitCount: number) => boolean
}

export function usePremium(): PremiumState {
  const [isPremium, setIsPremium] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!rcConfigured) {
      setIsLoading(false)
      return
    }
    try {
      const info = await Purchases.getCustomerInfo()
      setIsPremium(isPremiumFromInfo(info))
    } catch {
      setIsPremium(false)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()

    if (!rcConfigured) return
    // Keep isPremium in sync if the user's entitlements change (e.g. subscription lapse)
    const listener = (info: CustomerInfo) => setIsPremium(isPremiumFromInfo(info))
    Purchases.addCustomerInfoUpdateListener(listener)
    return () => { Purchases.removeCustomerInfoUpdateListener(listener) }
  }, [refresh])

  const purchase = useCallback(async (): Promise<boolean> => {
    if (!rcConfigured) return false
    try {
      const offerings = await Purchases.getOfferings()
      const pkg = offerings.current?.availablePackages[0]
      if (!pkg) return false
      const { customerInfo } = await Purchases.purchasePackage(pkg)
      const premium = isPremiumFromInfo(customerInfo)
      setIsPremium(premium)
      return premium
    } catch {
      return false
    }
  }, [])

  const restore = useCallback(async (): Promise<boolean> => {
    if (!rcConfigured) return false
    try {
      const info = await Purchases.restorePurchases()
      const premium = isPremiumFromInfo(info)
      setIsPremium(premium)
      return premium
    } catch {
      return false
    }
  }, [])

  const canAddHabit = useCallback(
    (currentHabitCount: number) => isPremium || currentHabitCount < FREE_HABIT_LIMIT,
    [isPremium],
  )

  return { isPremium, isLoading, purchase, restore, refresh, canAddHabit }
}
