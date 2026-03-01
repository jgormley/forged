import { useState, useEffect, useCallback } from 'react'
import { Platform, DeviceEventEmitter } from 'react-native'
import Purchases, { type CustomerInfo } from 'react-native-purchases'

const ENTITLEMENT_ID = 'forged_premium_lifetime'
export const FREE_HABIT_LIMIT = 2

const RC_API_KEY_IOS = process.env.EXPO_PUBLIC_RC_API_KEY_IOS ?? ''
const RC_API_KEY_ANDROID = process.env.EXPO_PUBLIC_RC_API_KEY_ANDROID ?? ''

let rcConfigured = false

// Call this once at app startup (module scope in _layout.tsx).
export function configureRevenueCat() {
  if (rcConfigured) return
  const key = Platform.OS === 'ios' ? RC_API_KEY_IOS : RC_API_KEY_ANDROID
  if (!key) {
    if (__DEV__) console.warn('[RC] No API key — purchases disabled')
    return
  }
  if (__DEV__) console.log('[RC] configure() — key prefix:', key.slice(0, 8))
  Purchases.configure({ apiKey: key })
  rcConfigured = true
}

function isPremiumFromInfo(info: CustomerInfo): boolean {
  return info.entitlements.active[ENTITLEMENT_ID] !== undefined
}

// ---------------------------------------------------------------------------
// Dev-only: force the app into free tier without touching RevenueCat.
// Call setDevForceFree(true) from the debug screen to simulate a non-premium
// user. Resets automatically on every Metro reload (module-level var).
// ---------------------------------------------------------------------------

const DEV_FORCE_FREE_EVENT = '__rc_devForceFree'
let _devForceFree = false

/** Toggle dev-only free-tier override. No-op in production builds. */
export function setDevForceFree(value: boolean): void {
  if (!__DEV__) return
  _devForceFree = value
  DeviceEventEmitter.emit(DEV_FORCE_FREE_EVENT, value)
}

export function getDevForceFree(): boolean {
  return __DEV__ && _devForceFree
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
  /** Whether the user can add another habit (free tier: max 2) */
  canAddHabit: (currentHabitCount: number) => boolean
}

export function usePremium(): PremiumState {
  const [isPremium, setIsPremium] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [devForceFree, setDevForceFreeState] = useState(() => __DEV__ && _devForceFree)

  // Listen for debug override changes so all mounted components update immediately.
  useEffect(() => {
    if (!__DEV__) return
    const sub = DeviceEventEmitter.addListener(DEV_FORCE_FREE_EVENT, (v: boolean) => {
      setDevForceFreeState(v)
    })
    return () => sub.remove()
  }, [])

  const refresh = useCallback(async () => {
    if (!rcConfigured) {
      if (__DEV__) console.log('[RC] refresh() skipped — not configured')
      setIsLoading(false)
      return
    }
    try {
      const info = await Purchases.getCustomerInfo()
      const premium = isPremiumFromInfo(info)
      if (__DEV__) {
        console.log('[RC] refresh() — activeEntitlements:', Object.keys(info.entitlements.active))
        console.log('[RC] refresh() — isPremium:', premium, '(checking for:', ENTITLEMENT_ID, ')')
      }
      setIsPremium(premium)
    } catch (e) {
      if (__DEV__) console.warn('[RC] refresh() error:', e)
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
    if (!rcConfigured) {
      if (__DEV__) console.warn('[RC] purchase() — not configured')
      return false
    }
    try {
      const offerings = await Purchases.getOfferings()
      if (__DEV__) {
        console.log('[RC] purchase() — current offering:', offerings.current?.identifier ?? 'null')
        console.log('[RC] purchase() — packages:', offerings.current?.availablePackages.map(p => p.identifier))
      }
      const pkg = offerings.current?.availablePackages[0]
      if (!pkg) {
        if (__DEV__) console.warn('[RC] purchase() — no package found; check RC dashboard offerings')
        return false
      }
      const { customerInfo } = await Purchases.purchasePackage(pkg)
      const premium = isPremiumFromInfo(customerInfo)
      if (__DEV__) {
        console.log('[RC] purchase() — activeEntitlements:', Object.keys(customerInfo.entitlements.active))
        console.log('[RC] purchase() — isPremium:', premium, '(checking for:', ENTITLEMENT_ID, ')')
      }
      setIsPremium(premium)
      // If the initial customerInfo doesn't show the entitlement (race condition
      // with RC's server-side activation), do a fresh fetch after a short delay.
      if (!premium) {
        setTimeout(async () => {
          const fresh = await Purchases.getCustomerInfo()
          const freshPremium = isPremiumFromInfo(fresh)
          if (__DEV__) console.log('[RC] purchase() — delayed refresh, isPremium:', freshPremium)
          setIsPremium(freshPremium)
        }, 2000)
      }
      return premium
    } catch (e: unknown) {
      if (__DEV__) console.warn('[RC] purchase() error:', e)
      return false
    }
  }, [])

  const restore = useCallback(async (): Promise<boolean> => {
    if (!rcConfigured) {
      if (__DEV__) console.warn('[RC] restore() — not configured')
      return false
    }
    try {
      const info = await Purchases.restorePurchases()
      const premium = isPremiumFromInfo(info)
      if (__DEV__) {
        console.log('[RC] restore() — activeEntitlements:', Object.keys(info.entitlements.active))
        console.log('[RC] restore() — isPremium:', premium)
      }
      setIsPremium(premium)
      return premium
    } catch (e: unknown) {
      if (__DEV__) console.warn('[RC] restore() error:', e)
      return false
    }
  }, [])

  // Apply dev override: if devForceFree is set, treat as non-premium regardless
  // of what RC says. This lets us test the paywall gate without touching RC.
  const effectivePremium = isPremium && !devForceFree

  const canAddHabit = useCallback(
    (currentHabitCount: number) => effectivePremium || currentHabitCount < FREE_HABIT_LIMIT,
    [effectivePremium],
  )

  return { isPremium: effectivePremium, isLoading, purchase, restore, refresh, canAddHabit }
}
