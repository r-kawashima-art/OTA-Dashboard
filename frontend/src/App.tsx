import { useEffect } from 'react'

import { fetchRivals } from './api/rivals'
import { KpiSelector } from './components/KpiSelector'
import { RegionPanel } from './components/RegionPanel'
import { RivalCategoryFilter } from './components/RivalCategoryFilter'
import { RivalSummaryCard } from './components/RivalSummaryCard'
import { WorldMap } from './components/WorldMap'
import { useRivalStore } from './stores/rivalStore'

function App() {
  const setRivals = useRivalStore((s) => s.setRivals)
  const setLoadError = useRivalStore((s) => s.setLoadError)
  const loadError = useRivalStore((s) => s.loadError)

  useEffect(() => {
    let cancelled = false
    fetchRivals()
      .then((payload) => {
        if (!cancelled) setRivals(payload.rivals)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        const message = err instanceof Error ? err.message : 'Unknown error'
        setLoadError(message)
      })
    return () => {
      cancelled = true
    }
  }, [setRivals, setLoadError])

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1 className="app-title">OTA Competitive Intelligence Dashboard</h1>
        <div className="app-header__controls">
          <RivalCategoryFilter />
          <KpiSelector />
        </div>
      </header>
      <main className="app-main">
        {loadError && (
          <div className="world-map__error" role="alert">
            Failed to load rivals: {loadError}
          </div>
        )}
        <WorldMap />
        <RivalSummaryCard />
        <RegionPanel />
      </main>
    </div>
  )
}

export default App
