import { useEffect, useState } from "react";
import { api, type RegionMetrics } from "../api";
import { useDashboard } from "../store";

export function ComparisonView() {
  const { compareRegions, clearCompare, year } = useDashboard((s) => ({
    compareRegions: s.compareRegions,
    clearCompare: s.clearCompare,
    year: s.year,
  }));
  const [data, setData] = useState<RegionMetrics[]>([]);

  useEffect(() => {
    if (compareRegions.length === 0) { setData([]); return; }
    Promise.all(compareRegions.map((iso) => api.regionMetrics(iso, year)))
      .then(setData)
      .catch(console.error);
  }, [compareRegions, year]);

  if (compareRegions.length === 0) return null;

  const metrics: { label: string; key: keyof RegionMetrics; fmt: (v: unknown) => string }[] = [
    { label: "Avg Booking Value", key: "avg_booking_value", fmt: (v) => `$${Number(v).toLocaleString()}` },
    { label: "Demand Index", key: "demand_index", fmt: (v) => String(v) },
    { label: "Continent", key: "continent", fmt: (v) => String(v) },
  ];

  const getMax = (key: keyof RegionMetrics) =>
    Math.max(...data.map((d) => Number(d[key]) || 0));

  return (
    <div className="comparison-view">
      <div className="comparison-header">
        <h2>Region Comparison</h2>
        <button className="clear-btn" onClick={clearCompare}>Clear ✕</button>
      </div>
      <div className="comparison-table-wrap">
        <table className="comparison-table">
          <thead>
            <tr>
              <th>Metric</th>
              {data.map((d) => <th key={d.iso_code}>{d.name}</th>)}
            </tr>
          </thead>
          <tbody>
            {metrics.map(({ label, key, fmt }) => {
              const max = getMax(key);
              return (
                <tr key={key}>
                  <td className="metric-label">{label}</td>
                  {data.map((d) => {
                    const isWinner = Number(d[key]) === max && max > 0;
                    return (
                      <td key={d.iso_code} className={isWinner ? "winner-cell" : ""}>
                        {fmt(d[key])}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
            <tr>
              <td className="metric-label">Top Rivals</td>
              {data.map((d) => (
                <td key={d.iso_code}>
                  {d.rivals?.slice(0, 3).map((r) => r.name).join(", ") ?? "—"}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
