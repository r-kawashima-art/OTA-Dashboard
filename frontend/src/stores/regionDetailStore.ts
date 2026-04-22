import { create } from 'zustand'

import { fetchRegionDetail } from '../api/regionDetail'
import type { RegionDetail } from '../types'

interface RegionDetailState {
  selectedIso: string | null
  detail: RegionDetail | null
  loading: boolean
  error: string | null
  openRegion: (iso: string) => Promise<void>
  closeRegion: () => void
}

export const useRegionDetailStore = create<RegionDetailState>((set, get) => ({
  selectedIso: null,
  detail: null,
  loading: false,
  error: null,
  openRegion: async (iso) => {
    if (get().selectedIso === iso && get().detail) return
    set({ selectedIso: iso, loading: true, error: null, detail: null })
    try {
      const detail = await fetchRegionDetail(iso)
      if (get().selectedIso !== iso) return
      set({ detail, loading: false })
    } catch (err) {
      if (get().selectedIso !== iso) return
      const message = err instanceof Error ? err.message : 'Unknown error'
      set({ error: message, loading: false })
    }
  },
  closeRegion: () => set({ selectedIso: null, detail: null, loading: false, error: null }),
}))
