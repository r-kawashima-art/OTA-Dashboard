import { useMemo } from 'react'

import { useComparisonStore } from '../stores/comparisonStore'
import {
  buildComparisonRows,
  findWinnerIndex,
  formatComparisonValue,
} from '../utils/comparison'

export function ComparisonPanel() {
  const selectedIsos = useComparisonStore((s) => s.selectedIsos)
  const details = useComparisonStore((s) => s.details)
  const loading = useComparisonStore((s) => s.loading)
  const error = useComparisonStore((s) => s.error)
  const removeRegion = useComparisonStore((s) => s.removeRegion)

  const rows = useMemo(() => {
    const orderedDetails = selectedIsos
      .map((iso) => details[iso])
      .filter((d): d is NonNullable<typeof d> => Boolean(d))
    return buildComparisonRows(orderedDetails)
  }, [selectedIsos, details])

  // Render only when at least 2 regions are picked — a 1-row table would
  // show no comparative value and only steal screen space from the map.
  if (selectedIsos.length < 2) return null

  return (
    <aside className="comparison-panel" role="region" aria-label="Region comparison">
      <header className="comparison-panel__header">
        <h2 className="comparison-panel__title">Region Comparison</h2>
        <p className="comparison-panel__subtitle">
          Highest value in each row is highlighted in green.
        </p>
      </header>
      {error && (
        <div className="comparison-panel__error" role="alert">
          {error}
        </div>
      )}
      <div className="comparison-panel__scroll">
        <table className="comparison-table">
          <thead>
            <tr>
              <th scope="col" className="comparison-table__metric">
                Metric
              </th>
              {selectedIsos.map((iso) => {
                const detail = details[iso]
                const isLoading = loading.has(iso)
                return (
                  <th key={iso} scope="col" className="comparison-table__region">
                    <div className="comparison-table__region-name">
                      {detail?.name ?? iso}
                      {isLoading && (
                        <span className="comparison-table__loading"> · loading…</span>
                      )}
                    </div>
                    <button
                      type="button"
                      className="comparison-table__remove"
                      aria-label={`Remove ${detail?.name ?? iso} from comparison`}
                      onClick={() => removeRegion(iso)}
                    >
                      ×
                    </button>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const winnerIndex = findWinnerIndex(row.values)
              return (
                <tr key={row.key}>
                  <th scope="row" className="comparison-table__metric">
                    {row.label}
                    {row.unit ? <span className="comparison-table__unit"> ({row.unit})</span> : null}
                  </th>
                  {row.values.map((value, idx) => {
                    const iso = selectedIsos[idx]
                    const isWinner = winnerIndex === idx
                    return (
                      <td
                        key={iso}
                        className={
                          isWinner
                            ? 'comparison-table__cell comparison-table__cell--winner'
                            : 'comparison-table__cell'
                        }
                      >
                        {formatComparisonValue(value, row.unit)}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </aside>
  )
}
