import { create } from 'zustand'

import { fetchRegionDetail } from '../api/regionDetail'
import type { RegionDetail } from '../types'

export const COMPARISON_MAX = 3

interface ComparisonState {
  selectedIsos: string[]
  details: Record<string, RegionDetail>
  loading: Set<string>
  error: string | null
  addRegion: (iso: string) => Promise<void>
  removeRegion: (iso: string) => void
  clear: () => void
}

export const useComparisonStore = create<ComparisonState>((set, get) => ({
  selectedIsos: [],
  details: {},
  loading: new Set<string>(),
  error: null,
  addRegion: async (iso) => {
    const { selectedIsos, details, loading } = get()
    if (selectedIsos.includes(iso)) return
    if (selectedIsos.length >= COMPARISON_MAX) return

    set({ selectedIsos: [...selectedIsos, iso] })

    if (details[iso] || loading.has(iso)) return
    const nextLoading = new Set(loading)
    nextLoading.add(iso)
    set({ loading: nextLoading, error: null })

    try {
      const detail = await fetchRegionDetail(iso)
      const after = get()
      // Drop the in-flight fetch silently if the user removed the region while
      // the request was open — avoids surfacing a stale row in the table.
      if (!after.selectedIsos.includes(iso)) {
        const cleared = new Set(after.loading)
        cleared.delete(iso)
        set({ loading: cleared })
        return
      }
      const cleared = new Set(after.loading)
      cleared.delete(iso)
      set({
        details: { ...after.details, [iso]: detail },
        loading: cleared,
      })
    } catch (err) {
      const after = get()
      const cleared = new Set(after.loading)
      cleared.delete(iso)
      const message = err instanceof Error ? err.message : 'Unknown error'
      set({ loading: cleared, error: message })
    }
  },
  removeRegion: (iso) =>
    set((state) => ({
      selectedIsos: state.selectedIsos.filter((c) => c !== iso),
    })),
  clear: () => set({ selectedIsos: [], error: null }),
}))
