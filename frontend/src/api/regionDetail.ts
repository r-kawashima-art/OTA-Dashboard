import type { RegionDetail } from '../types'

export async function fetchRegionDetail(isoCode: string): Promise<RegionDetail> {
  const response = await fetch(`/api/regions/${encodeURIComponent(isoCode)}`)
  if (!response.ok) {
    throw new Error(`Failed to fetch region ${isoCode}: ${response.status} ${response.statusText}`)
  }
  return (await response.json()) as RegionDetail
}
