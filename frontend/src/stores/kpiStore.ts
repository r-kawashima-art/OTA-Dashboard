import { create } from 'zustand'

import type { KpiKey } from '../types'

interface KpiState {
  selectedKpi: KpiKey
  setSelectedKpi: (kpi: KpiKey) => void
}

export const useKpiStore = create<KpiState>((set) => ({
  selectedKpi: 'demand_index',
  setSelectedKpi: (kpi) => {
    set({ selectedKpi: kpi })
  },
}))
