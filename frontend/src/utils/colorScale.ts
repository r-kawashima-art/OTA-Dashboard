/** Maps a 0–100 demand index to a hex color along a blue→red gradient. */
export function demandColor(index: number): string {
  const clamped = Math.max(0, Math.min(100, index));
  // Low = cool blue, high = warm red
  const stops: [number, [number, number, number]][] = [
    [0,   [59,  130, 246]],   // blue-500
    [50,  [234, 179, 8]],     // yellow-500
    [100, [239, 68,  68]],    // red-500
  ];

  let lo = stops[0], hi = stops[stops.length - 1];
  for (let i = 0; i < stops.length - 1; i++) {
    if (clamped <= stops[i + 1][0]) {
      lo = stops[i];
      hi = stops[i + 1];
      break;
    }
  }

  const t = (clamped - lo[0]) / (hi[0] - lo[0] || 1);
  const [r, g, b] = lo[1].map((c, i) => Math.round(c + t * (hi[1][i] - c)));
  return `rgb(${r},${g},${b})`;
}

/** Returns opacity based on intensity (0.3–0.85 range for choropleth legibility). */
export function demandOpacity(index: number): number {
  return 0.3 + (Math.max(0, Math.min(100, index)) / 100) * 0.55;
}
