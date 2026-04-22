import type { DemographicSegment } from '../types'

export interface NormalizedSegment {
  segment: string
  share_pct: number
}

/**
 * Renormalize demographic segments so their `share_pct` values sum to 100.
 *
 * The API may return segments that sum to slightly more or less than 100 due
 * to rounding, or to zero (if the region has no seeded data). We handle both:
 *
 * - Non-zero total → proportionally rescale each share to 100.
 * - Zero / empty   → return an empty list so the donut can show an empty state.
 * - Negative / NaN shares are clamped to 0.
 */
export function normalizeDemographics(
  segments: readonly DemographicSegment[],
): NormalizedSegment[] {
  const cleaned = segments
    .filter((s) => typeof s.share_pct === 'number' && Number.isFinite(s.share_pct))
    .map((s) => ({ segment: s.segment, share_pct: Math.max(0, s.share_pct) }))

  const total = cleaned.reduce((acc, s) => acc + s.share_pct, 0)
  if (total === 0) return []

  return cleaned.map((s) => ({
    segment: s.segment,
    share_pct: Number(((s.share_pct / total) * 100).toFixed(1)),
  }))
}
