import type { FeatureCollection, MultiPolygon, Polygon } from 'geojson'

export type KpiKey = 'demand_index' | 'avg_booking_value'

export interface KpiDefinition {
  key: KpiKey
  label: string
  unit: string
  format: (value: number) => string
}

export interface RegionProperties {
  iso_code: string
  name: string
  continent: string | null
  demand_index: number | null
  avg_booking_value: number | null
  snapshot_month: string | null
}

export type RegionGeometry = Polygon | MultiPolygon
export type RegionFeatureCollection = FeatureCollection<RegionGeometry, RegionProperties>

export interface Rival {
  id: string
  name: string
  hq_country: string | null
  category: string | null
  business_model: string | null
  ai_strategy: string | null
  website: string | null
  lat: number
  lng: number
}

export interface RivalsResponse {
  rivals: Rival[]
  count: number
}

export const KPI_DEFINITIONS: Record<KpiKey, KpiDefinition> = {
  demand_index: {
    key: 'demand_index',
    label: 'Demand Index',
    unit: '',
    format: (v) => v.toFixed(0),
  },
  avg_booking_value: {
    key: 'avg_booking_value',
    label: 'Avg Booking Value',
    unit: 'USD',
    format: (v) => `$${v.toFixed(2)}`,
  },
}
