import { useMemo } from 'react'
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

import type { DemographicSegment } from '../types'
import { normalizeDemographics } from '../utils/demographics'

const SEGMENT_COLORS = ['#7c3aed', '#0284c7', '#10b981', '#f59e0b', '#ef4444', '#64748b']

interface Props {
  segments: DemographicSegment[]
}

export function DemographicsDonut({ segments }: Props) {
  const normalized = useMemo(() => normalizeDemographics(segments), [segments])

  if (normalized.length === 0) {
    return <p className="region-panel__empty">No demographics data seeded for this region.</p>
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={normalized}
          dataKey="share_pct"
          nameKey="segment"
          innerRadius={45}
          outerRadius={75}
          paddingAngle={2}
        >
          {normalized.map((entry, idx) => (
            <Cell key={entry.segment} fill={SEGMENT_COLORS[idx % SEGMENT_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number) => `${value.toFixed(1)}%`}
          contentStyle={{ fontSize: 12, borderRadius: 6, borderColor: '#cbd5e1' }}
        />
        <Legend
          verticalAlign="bottom"
          iconSize={10}
          wrapperStyle={{ fontSize: 11 }}
          formatter={(value: string) => {
            const entry = normalized.find((s) => s.segment === value)
            return entry ? `${value} · ${entry.share_pct.toFixed(1)}%` : value
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
