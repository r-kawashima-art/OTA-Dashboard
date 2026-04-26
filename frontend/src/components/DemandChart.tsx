import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import type { MonthlyDemandPoint } from '../types'

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

interface Props {
  series: MonthlyDemandPoint[]
}

export function DemandChart({ series }: Props) {
  if (series.length === 0) {
    return <p className="region-panel__empty">No demand data seeded for this region.</p>
  }

  const data = series.map((p) => ({
    month: MONTH_LABELS[p.month - 1] ?? String(p.month),
    value: p.value,
  }))

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 4, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
        <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#94a3b8" />
        <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" width={28} />
        <Tooltip
          cursor={{ fill: '#f1f5f9' }}
          contentStyle={{ fontSize: 12, borderRadius: 6, borderColor: '#cbd5e1' }}
        />
        <Bar dataKey="value" fill="#0284c7" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
