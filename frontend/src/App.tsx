import { useDashboard } from "./store";
import { api } from "./api";
import { KpiHeader } from "./components/KpiHeader";
import { WorldMap } from "./components/WorldMap";
import { RegionalPanel } from "./components/RegionalPanel";
import { ComparisonView } from "./components/ComparisonView";
import { FilterBar } from "./components/FilterBar";
import "./App.css";

export default function App() {
  const { selectedRegion, year, setSelectedRegion } = useDashboard((s) => ({
    selectedRegion: s.selectedRegion,
    year: s.year,
    setSelectedRegion: s.setSelectedRegion,
  }));

  const handleExport = () => {
    if (!selectedRegion) return;
    window.open(api.exportUrl(selectedRegion, year), "_blank");
  };

  return (
    <div className="app">
      <KpiHeader />
      <FilterBar onExport={handleExport} />
      <div className="main-layout">
        <WorldMap />
        {selectedRegion && (
          <div className="panel-wrap">
            <button type="button" className="panel-close" onClick={() => setSelectedRegion(null)}>✕</button>
            <RegionalPanel />
          </div>
        )}
      </div>
      <ComparisonView />
    </div>
  );
}
