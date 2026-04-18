import { useEffect } from "react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { api } from "../api";
import { useDashboard } from "../store";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const PIE_COLORS = ["#3b82f6","#f59e0b","#10b981","#8b5cf6"];

export function RegionalPanel() {
  const { selectedRegion, regionMetrics, setRegionMetrics, year, toggleCompare, compareRegions, setKpis } =
    useDashboard((s) => ({
      selectedRegion: s.selectedRegion,
      regionMetrics: s.regionMetrics,
      setRegionMetrics: s.setRegionMetrics,
      year: s.year,
      toggleCompare: s.toggleCompare,
      compareRegions: s.compareRegions,
      setKpis: s.setKpis,
    }));

  useEffect(() => {
    if (!selectedRegion) { setRegionMetrics(null); return; }
    api.regionMetrics(selectedRegion, year).then(setRegionMetrics).catch(console.error);
  }, [selectedRegion, year]);

  if (!selectedRegion || !regionMetrics) return null;

  const demandData = (regionMetrics.monthly_demand ?? []).map((v, i) => ({
    month: MONTHS[i],
    demand: v,
  }));

  const demoData = Object.entries(regionMetrics.demographics ?? {}).map(([name, value]) => ({
    name,
    value,
  }));

  const isCompared = compareRegions.includes(selectedRegion);

  return (
    <aside className="regional-panel">
      <div className="panel-header">
        <h2>{regionMetrics.name}</h2>
        <span className="panel-continent">{regionMetrics.continent}</span>
        <button
          className={`compare-btn ${isCompared ? "active" : ""}`}
          onClick={() => toggleCompare(selectedRegion)}
          disabled={!isCompared && compareRegions.length >= 3}
        >
          {isCompared ? "✓ In Comparison" : "+ Compare"}
        </button>
      </div>

      <div className="panel-kpis">
        <Stat label="Avg Booking Value" value={`$${regionMetrics.avg_booking_value?.toLocaleString() ?? "N/A"}`} />
        <Stat label="Demand Index" value={regionMetrics.demand_index ?? "N/A"} />
      </div>

      {demandData.length > 0 && (
        <section className="panel-section">
          <h3>Seasonal Demand</h3>
          <ResponsiveContainer width="100%" height={140}>
            <AreaChart data={demandData}>
              <defs>
                <linearGradient id="demandGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Area type="monotone" dataKey="demand" stroke="#3b82f6" fill="url(#demandGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </section>
      )}

      {regionMetrics.top_routes?.length > 0 && (
        <section className="panel-section">
          <h3>Top Routes</h3>
          <ol className="routes-list">
            {regionMetrics.top_routes.map((r) => <li key={r}>{r}</li>)}
          </ol>
        </section>
      )}

      {demoData.length > 0 && (
        <section className="panel-section">
          <h3>Traveler Mix</h3>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={demoData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} label>
                {demoData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </section>
      )}

      {regionMetrics.rivals?.length > 0 && (
        <section className="panel-section">
          <h3>Rival Ranking</h3>
          <table className="rival-table">
            <thead>
              <tr><th>#</th><th>Company</th><th>Share %</th><th>Bookings</th></tr>
            </thead>
            <tbody>
              {regionMetrics.rivals.map((r, i) => (
                <tr key={r.id}>
                  <td>{i + 1}</td>
                  <td>{r.name}</td>
                  <td>{r.market_share_pct?.toFixed(1)}%</td>
                  <td>{(r.booking_volume / 1_000_000).toFixed(1)}M</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </aside>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="panel-stat">
      <span className="stat-value">{value}</span>
      <span className="stat-label">{label}</span>
    </div>
  );
}
