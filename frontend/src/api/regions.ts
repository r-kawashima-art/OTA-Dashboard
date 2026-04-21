import type { RegionFeatureCollection } from '../types'

export async function fetchRegions(): Promise<RegionFeatureCollection> {
  const response = await fetch('/api/regions')
  if (!response.ok) {
    throw new Error(`Failed to fetch regions: ${response.status} ${response.statusText}`)
  }
  return (await response.json()) as RegionFeatureCollection
}
