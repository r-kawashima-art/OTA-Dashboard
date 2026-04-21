import type { ChangeEvent } from 'react'

import { useKpiStore } from '../stores/kpiStore'
import { KPI_DEFINITIONS, type KpiKey } from '../types'

export function KpiSelector() {
  const selectedKpi = useKpiStore((s) => s.selectedKpi)
  const setSelectedKpi = useKpiStore((s) => s.setSelectedKpi)

  const onChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedKpi(event.target.value as KpiKey)
  }

  return (
    <label className="kpi-selector">
      <span className="kpi-selector__label">KPI</span>
      <select className="kpi-selector__select" value={selectedKpi} onChange={onChange}>
        {Object.values(KPI_DEFINITIONS).map((def) => (
          <option key={def.key} value={def.key}>
            {def.label}
          </option>
        ))}
      </select>
    </label>
  )
}
