import { useEffect } from "react";
import { api } from "../api";
import { useDashboard } from "../store";

export function KpiHeader() {
  const kpis = useDashboard((s) => s.kpis);
  const setKpis = useDashboard((s) => s.setKpis);
  const year = useDashboard((s) => s.year);

  useEffect(() => {
    api.kpis(year).then(setKpis).catch(console.error);
  }, [year]);

  const fmt = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

  return (
    <header className="kpi-header">
      <div className="kpi-brand">OTA Intelligence Dashboard</div>
      <div className="kpi-cards">
        <KpiCard label="Markets Tracked" value={kpis?.markets_covered ?? "—"} />
        <KpiCard label="Rivals Monitored" value={kpis?.rivals_tracked ?? "—"} />
        <KpiCard
          label="Hottest Region"
          value={kpis?.hottest_region?.name ?? "—"}
          sub={kpis?.hottest_region ? `Demand Index: ${kpis.hottest_region.demand_index}` : undefined}
        />
      </div>
      {kpis?.last_updated && (
        <div className="kpi-updated">Last updated: {fmt(kpis.last_updated)}</div>
      )}
    </header>
  );
}

function KpiCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="kpi-card">
      <span className="kpi-value">{value}</span>
      <span className="kpi-label">{label}</span>
      {sub && <span className="kpi-sub">{sub}</span>}
    </div>
  );
}
