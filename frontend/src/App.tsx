import { KpiSelector } from './components/KpiSelector'
import { WorldMap } from './components/WorldMap'

function App() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <h1 className="app-title">OTA Competitive Intelligence Dashboard</h1>
        <KpiSelector />
      </header>
      <main className="app-main">
        <WorldMap />
      </main>
    </div>
  )
}

export default App
