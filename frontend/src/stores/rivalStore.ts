import { create } from 'zustand'

import type { Rival } from '../types'

interface RivalState {
  rivals: Rival[]
  loadError: string | null
  activeCategories: Set<string>
  selectedRivalId: string | null
  setRivals: (rivals: Rival[]) => void
  setLoadError: (message: string | null) => void
  toggleCategory: (category: string) => void
  resetCategories: () => void
  selectRival: (id: string | null) => void
}

export const useRivalStore = create<RivalState>((set) => ({
  rivals: [],
  loadError: null,
  activeCategories: new Set<string>(),
  selectedRivalId: null,
  setRivals: (rivals) => {
    const categories = new Set(
      rivals.map((r) => r.category).filter((c): c is string => Boolean(c)),
    )
    set({ rivals, activeCategories: categories, loadError: null })
  },
  setLoadError: (message) => set({ loadError: message }),
  toggleCategory: (category) =>
    set((state) => {
      const next = new Set(state.activeCategories)
      if (next.has(category)) {
        next.delete(category)
      } else {
        next.add(category)
      }
      return { activeCategories: next }
    }),
  resetCategories: () =>
    set((state) => ({
      activeCategories: new Set(
        state.rivals.map((r) => r.category).filter((c): c is string => Boolean(c)),
      ),
    })),
  selectRival: (id) => set({ selectedRivalId: id }),
}))
