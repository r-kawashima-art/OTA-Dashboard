import type { RivalsResponse } from '../types'

export async function fetchRivals(): Promise<RivalsResponse> {
  const response = await fetch('/api/rivals')
  if (!response.ok) {
    throw new Error(`Failed to fetch rivals: ${response.status} ${response.statusText}`)
  }
  return (await response.json()) as RivalsResponse
}
