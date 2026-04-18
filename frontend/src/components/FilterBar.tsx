import { useDashboard } from "../store";
import { api } from "../api";

const CATEGORIES = ["All", "B2C", "B2B", "budget", "luxury"];
const YEARS = [2023, 2024, 2025];

interface Props {
  onExport: () => void;
}

export function FilterBar({ onExport }: Props) {
  const { year, setYear, categoryFilter, setCategoryFilter, selectedRegion } = useDashboard(
    (s) => ({
      year: s.year,
      setYear: s.setYear,
      categoryFilter: s.categoryFilter,
      setCategoryFilter: s.setCategoryFilter,
      selectedRegion: s.selectedRegion,
    })
  );

  return (
    <div className="filter-bar">
      <div className="filter-group">
        <label>Year</label>
        <select value={year} onChange={(e) => setYear(Number(e.target.value))}>
          {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      <div className="filter-group">
        <label>Category</label>
        <div className="category-pills">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              className={`pill ${(c === "All" ? !categoryFilter : categoryFilter === c) ? "active" : ""}`}
              onClick={() => setCategoryFilter(c === "All" ? null : c)}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {selectedRegion && (
        <button className="export-btn" onClick={onExport}>
          ↓ Export CSV
        </button>
      )}
    </div>
  );
}
