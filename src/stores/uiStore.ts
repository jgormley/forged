import { create } from 'zustand'

// ---------------------------------------------------------------------------
// Milestone modal — fires at 7 / 30 / 100 day streaks
// ---------------------------------------------------------------------------

export type MilestoneTier = 7 | 30 | 100

interface MilestoneState {
  habitId: string
  habitName: string
  habitIcon: string
  streak: number
  tier: MilestoneTier
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

interface UIState {
  // Milestone celebration modal
  milestone: MilestoneState | null
  showMilestone: (state: MilestoneState) => void
  dismissMilestone: () => void

  // Paywall modal
  isPaywallVisible: boolean
  showPaywall: () => void
  hidePaywall: () => void

  // Global loading overlay (e.g. during IAP restore)
  isGlobalLoading: boolean
  setGlobalLoading: (loading: boolean) => void

  // Toast / snackbar
  toast: { message: string; type: 'success' | 'error' | 'info' } | null
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void
  dismissToast: () => void
}

export const useUIStore = create<UIState>((set) => ({
  milestone: null,
  showMilestone: (state) => set({ milestone: state }),
  dismissMilestone: () => set({ milestone: null }),

  isPaywallVisible: false,
  showPaywall: () => set({ isPaywallVisible: true }),
  hidePaywall: () => set({ isPaywallVisible: false }),

  isGlobalLoading: false,
  setGlobalLoading: (loading) => set({ isGlobalLoading: loading }),

  toast: null,
  showToast: (message, type = 'info') => set({ toast: { message, type } }),
  dismissToast: () => set({ toast: null }),
}))

// ---------------------------------------------------------------------------
// Milestone tier helper — call after every successful check-off
// ---------------------------------------------------------------------------

export const MILESTONE_TIERS: MilestoneTier[] = [7, 30, 100]

export function getMilestoneTier(streak: number): MilestoneTier | null {
  return MILESTONE_TIERS.includes(streak as MilestoneTier)
    ? (streak as MilestoneTier)
    : null
}
