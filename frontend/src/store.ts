import { create } from "zustand";
import type { RegionMetrics, GlobalKpis, Rival } from "./api";

interface DashboardState {
  year: number;
  setYear: (y: number) => void;

  selectedRegion: string | null;
  setSelectedRegion: (iso: string | null) => void;

  regionMetrics: RegionMetrics | null;
  setRegionMetrics: (m: RegionMetrics | null) => void;

  compareRegions: string[];
  toggleCompare: (iso: string) => void;
  clearCompare: () => void;

  kpis: GlobalKpis | null;
  setKpis: (k: GlobalKpis) => void;

  rivals: Rival[];
  setRivals: (r: Rival[]) => void;

  categoryFilter: string | null;
  setCategoryFilter: (c: string | null) => void;
}

export const useDashboard = create<DashboardState>((set) => ({
  year: 2025,
  setYear: (year) => set({ year }),

  selectedRegion: null,
  setSelectedRegion: (selectedRegion) => set({ selectedRegion }),

  regionMetrics: null,
  setRegionMetrics: (regionMetrics) => set({ regionMetrics }),

  compareRegions: [],
  toggleCompare: (iso) =>
    set((s) => {
      if (s.compareRegions.includes(iso)) {
        return { compareRegions: s.compareRegions.filter((r) => r !== iso) };
      }
      if (s.compareRegions.length >= 3) return s;
      return { compareRegions: [...s.compareRegions, iso] };
    }),
  clearCompare: () => set({ compareRegions: [] }),

  kpis: null,
  setKpis: (kpis) => set({ kpis }),

  rivals: [],
  setRivals: (rivals) => set({ rivals }),

  categoryFilter: null,
  setCategoryFilter: (categoryFilter) => set({ categoryFilter }),
}));
