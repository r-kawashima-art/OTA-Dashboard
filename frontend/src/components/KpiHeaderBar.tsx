import { useEffect, useState } from 'react'

import { fetchGlobalKpis } from '../api/globalKpis'
import { useRivalStore } from '../stores/rivalStore'
import type { GlobalKpis } from '../types'

export function KpiHeaderBar() {
  const [kpis, setKpis] = useState<GlobalKpis | null>(null)
  const [error, setError] = useState<string | null>(null)

  const rivals = useRivalStore((s) => s.rivals)
  const activeCategories = useRivalStore((s) => s.activeCategories)

  useEffect(() => {
    let cancelled = false
    fetchGlobalKpis()
      .then((data) => {
        if (!cancelled) setKpis(data)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        const message = err instanceof Error ? err.message : 'Unknown error'
        setError(message)
      })
    return () => {
      cancelled = true
    }
  }, [])

  // Filtered rival count tracks the live category filter so the header reacts
  // to user input without needing a re-fetch. A rival counts when *any* of
  // its categories is currently active (matches the marker-layer semantics).
  const filteredRivalCount = rivals.filter((r) =>
    r.categories.some((c) => activeCategories.has(c)),
  ).length
  const totalRivals = kpis?.tracked_rivals ?? rivals.length
  const isFiltered = filteredRivalCount !== totalRivals

  return (
    <section className="kpi-header" aria-label="Global KPIs">
      {error && (
        <div className="kpi-header__error" role="alert">
          KPIs unavailable: {error}
        </div>
      )}
      <div className="kpi-header__tile">
        <div className="kpi-header__label">Markets Covered</div>
        <div className="kpi-header__value">{kpis ? kpis.markets_covered : '—'}</div>
        <div className="kpi-header__hint">countries with data</div>
      </div>
      <div className="kpi-header__tile">
        <div className="kpi-header__label">Tracked Rivals</div>
        <div className="kpi-header__value">
          {filteredRivalCount}
          {isFiltered && <span className="kpi-header__sub"> / {totalRivals}</span>}
        </div>
        <div className="kpi-header__hint">
          {isFiltered ? 'matching active filter' : 'in roster'}
        </div>
      </div>
      <div className="kpi-header__tile">
        <div className="kpi-header__label">Hottest Growth</div>
        <div className="kpi-header__value">
          {kpis?.hottest_growth_region ? kpis.hottest_growth_region.name : '—'}
        </div>
        <div className="kpi-header__hint">
          {kpis?.hottest_growth_region
            ? `Demand index ${kpis.hottest_growth_region.demand_index}`
            : 'no snapshots yet'}
        </div>
      </div>
    </section>
  )
}
