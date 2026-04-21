/**
 * Sequential color scale: maps a numeric value to a hex color between a light
 * "cold" endpoint and a saturated "hot" endpoint. Values outside [min, max]
 * are clamped. When min === max we return the hot color (degenerate scale).
 */

export const CHOROPLETH_MIN_COLOR: [number, number, number] = [224, 242, 254] // tailwind sky-100
export const CHOROPLETH_MAX_COLOR: [number, number, number] = [2, 132, 199] // tailwind sky-600
export const CHOROPLETH_NULL_COLOR = '#e5e7eb' // tailwind gray-200

function toHex(channel: number): string {
  return Math.round(channel).toString(16).padStart(2, '0')
}

function rgbToHex(rgb: readonly [number, number, number]): string {
  return `#${toHex(rgb[0])}${toHex(rgb[1])}${toHex(rgb[2])}`
}

export function interpolateRgb(
  from: readonly [number, number, number],
  to: readonly [number, number, number],
  t: number,
): [number, number, number] {
  const clamped = Math.max(0, Math.min(1, t))
  return [
    from[0] + (to[0] - from[0]) * clamped,
    from[1] + (to[1] - from[1]) * clamped,
    from[2] + (to[2] - from[2]) * clamped,
  ]
}

export interface ColorScaleOptions {
  min: number
  max: number
  minColor?: readonly [number, number, number]
  maxColor?: readonly [number, number, number]
  nullColor?: string
}

export function kpiColor(value: number | null | undefined, options: ColorScaleOptions): string {
  const {
    min,
    max,
    minColor = CHOROPLETH_MIN_COLOR,
    maxColor = CHOROPLETH_MAX_COLOR,
    nullColor = CHOROPLETH_NULL_COLOR,
  } = options

  if (value === null || value === undefined || Number.isNaN(value)) {
    return nullColor
  }

  if (max <= min) {
    return rgbToHex(maxColor)
  }

  const t = (value - min) / (max - min)
  return rgbToHex(interpolateRgb(minColor, maxColor, t))
}

export function computeExtent(values: readonly (number | null | undefined)[]): {
  min: number
  max: number
} | null {
  let min = Infinity
  let max = -Infinity
  for (const v of values) {
    if (v === null || v === undefined || Number.isNaN(v)) continue
    if (v < min) min = v
    if (v > max) max = v
  }
  if (!Number.isFinite(min) || !Number.isFinite(max)) return null
  return { min, max }
}
