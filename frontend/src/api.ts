const BASE = "http://localhost:8000";

export interface Region {
  iso_code: string;
  name: string;
  continent: string;
}

export interface Rival {
  id: string;
  name: string;
  hq_country: string;
  category: string;
  business_model: string;
  ai_strategy: string | null;
  website: string | null;
  market_share_pct?: number;
  booking_volume?: number;
  region_iso?: string;
}

export interface RegionMetrics {
  iso_code: string;
  name: string;
  continent: string;
  avg_booking_value: number;
  demand_index: number;
  top_routes: string[];
  demographics: Record<string, number>;
  monthly_demand: number[];
  last_updated: string;
  rivals: Rival[];
}

export interface GlobalKpis {
  markets_covered: number;
  rivals_tracked: number;
  hottest_region: { name: string; demand_index: number };
  last_updated: string;
}

async function get<T>(path: string, params?: Record<string, string | number>): Promise<T> {
  const url = new URL(BASE + path);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));
  }
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

export const api = {
  regions: (year?: number) => get<Region[]>("/api/regions", year ? { year } : undefined),
  regionMetrics: (iso: string, year: number) =>
    get<RegionMetrics>(`/api/regions/${iso}/metrics`, { year }),
  rivals: (params?: { region?: string; category?: string; year?: number }) =>
    get<Rival[]>("/api/rivals", params as Record<string, string | number>),
  kpis: (year: number) => get<GlobalKpis>("/api/kpis/global", { year }),
  exportUrl: (region: string, year: number) =>
    `${BASE}/api/export?region=${region}&year=${year}`,
};
