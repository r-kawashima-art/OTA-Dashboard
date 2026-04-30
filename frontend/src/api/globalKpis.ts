import type { GlobalKpis } from '../types'

export async function fetchGlobalKpis(): Promise<GlobalKpis> {
  const response = await fetch('/api/kpis/global')
  if (!response.ok) {
    throw new Error(`Failed to fetch global KPIs: ${response.status} ${response.statusText}`)
  }
  return (await response.json()) as GlobalKpis
}
