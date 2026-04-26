import { describe, expect, it } from 'vitest'

import { normalizeDemographics } from './demographics'

const sum = (xs: { share_pct: number }[]) =>
  Number(xs.reduce((acc, s) => acc + s.share_pct, 0).toFixed(1))

describe('normalizeDemographics', () => {
  it('returns segments that sum to 100 when input already does', () => {
    const out = normalizeDemographics([
      { segment: 'Leisure', share_pct: 58 },
      { segment: 'Business', share_pct: 27 },
      { segment: 'VFR', share_pct: 10 },
      { segment: 'Group', share_pct: 5 },
    ])
    expect(out).toHaveLength(4)
    expect(sum(out)).toBe(100)
  })

  it('rescales when input totals 99.5 due to rounding', () => {
    const out = normalizeDemographics([
      { segment: 'A', share_pct: 49.7 },
      { segment: 'B', share_pct: 49.8 },
    ])
    expect(sum(out)).toBe(100)
  })

  it('rescales when input totals well above 100', () => {
    const out = normalizeDemographics([
      { segment: 'A', share_pct: 120 },
      { segment: 'B', share_pct: 80 },
    ])
    expect(sum(out)).toBe(100)
    expect(out[0].share_pct).toBeCloseTo(60, 1)
    expect(out[1].share_pct).toBeCloseTo(40, 1)
  })

  it('returns empty list for empty input', () => {
    expect(normalizeDemographics([])).toEqual([])
  })

  it('returns empty list when every share is zero', () => {
    expect(
      normalizeDemographics([
        { segment: 'A', share_pct: 0 },
        { segment: 'B', share_pct: 0 },
      ]),
    ).toEqual([])
  })

  it('clamps negative shares to zero before normalizing', () => {
    const out = normalizeDemographics([
      { segment: 'A', share_pct: -10 },
      { segment: 'B', share_pct: 50 },
    ])
    expect(sum(out)).toBe(100)
    expect(out.find((s) => s.segment === 'B')?.share_pct).toBe(100)
  })

  it('drops NaN/Infinity shares', () => {
    const out = normalizeDemographics([
      { segment: 'A', share_pct: Number.NaN },
      { segment: 'B', share_pct: Number.POSITIVE_INFINITY },
      { segment: 'C', share_pct: 25 },
    ])
    expect(out).toHaveLength(1)
    expect(out[0]).toEqual({ segment: 'C', share_pct: 100 })
  })
})
