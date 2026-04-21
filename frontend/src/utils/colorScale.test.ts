import { describe, expect, it } from 'vitest'
import {
  CHOROPLETH_MAX_COLOR,
  CHOROPLETH_MIN_COLOR,
  CHOROPLETH_NULL_COLOR,
  computeExtent,
  interpolateRgb,
  kpiColor,
} from './colorScale'

describe('interpolateRgb', () => {
  it('returns the start color at t=0', () => {
    expect(interpolateRgb([0, 0, 0], [255, 255, 255], 0)).toEqual([0, 0, 0])
  })

  it('returns the end color at t=1', () => {
    expect(interpolateRgb([0, 0, 0], [255, 255, 255], 1)).toEqual([255, 255, 255])
  })

  it('returns the midpoint at t=0.5', () => {
    expect(interpolateRgb([0, 0, 0], [200, 100, 50], 0.5)).toEqual([100, 50, 25])
  })

  it('clamps t below 0', () => {
    expect(interpolateRgb([10, 20, 30], [200, 200, 200], -0.5)).toEqual([10, 20, 30])
  })

  it('clamps t above 1', () => {
    expect(interpolateRgb([10, 20, 30], [200, 200, 200], 2)).toEqual([200, 200, 200])
  })
})

describe('kpiColor', () => {
  const scale = { min: 0, max: 100 }

  it('returns a 7-character hex string', () => {
    const color = kpiColor(50, scale)
    expect(color).toMatch(/^#[0-9a-f]{6}$/)
  })

  it('returns the min color at the minimum', () => {
    const [r, g, b] = CHOROPLETH_MIN_COLOR
    const expected = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
    expect(kpiColor(0, scale)).toBe(expected)
  })

  it('returns the max color at the maximum', () => {
    const [r, g, b] = CHOROPLETH_MAX_COLOR
    const expected = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
    expect(kpiColor(100, scale)).toBe(expected)
  })

  it('returns a darker color for higher values', () => {
    // Higher value → closer to max (darker blue) → lower channel sums
    const low = kpiColor(10, scale)
    const high = kpiColor(90, scale)
    const sumChannels = (hex: string) =>
      parseInt(hex.slice(1, 3), 16) + parseInt(hex.slice(3, 5), 16) + parseInt(hex.slice(5, 7), 16)
    expect(sumChannels(high)).toBeLessThan(sumChannels(low))
  })

  it('returns null color for null / undefined / NaN values', () => {
    expect(kpiColor(null, scale)).toBe(CHOROPLETH_NULL_COLOR)
    expect(kpiColor(undefined, scale)).toBe(CHOROPLETH_NULL_COLOR)
    expect(kpiColor(NaN, scale)).toBe(CHOROPLETH_NULL_COLOR)
  })

  it('clamps values below min to the min color', () => {
    expect(kpiColor(-100, scale)).toBe(kpiColor(0, scale))
  })

  it('clamps values above max to the max color', () => {
    expect(kpiColor(500, scale)).toBe(kpiColor(100, scale))
  })

  it('returns the max color when min === max (degenerate scale)', () => {
    const [r, g, b] = CHOROPLETH_MAX_COLOR
    const expected = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
    expect(kpiColor(42, { min: 42, max: 42 })).toBe(expected)
  })
})

describe('computeExtent', () => {
  it('returns min and max ignoring null / undefined / NaN', () => {
    expect(computeExtent([10, null, 50, undefined, NaN, 30])).toEqual({ min: 10, max: 50 })
  })

  it('returns null when all values are null', () => {
    expect(computeExtent([null, undefined, NaN])).toBeNull()
  })

  it('returns null for an empty array', () => {
    expect(computeExtent([])).toBeNull()
  })

  it('returns { min: v, max: v } for a single value', () => {
    expect(computeExtent([7])).toEqual({ min: 7, max: 7 })
  })
})
