'use client'

import {
  ComposedChart, Line, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer, Legend,
} from 'recharts'
import { ProjectionData } from '@/types'

interface ProjectionChartProps {
  projection: ProjectionData
}

const TOOLTIP_STYLE = {
  backgroundColor: '#1E293B',
  border: '1px solid #334155',
  borderRadius: '8px',
  color: '#F8FAFC',
  fontSize: '12px',
  fontFamily: 'JetBrains Mono, monospace',
}

function formatValue(value: number): string {
  if (Math.abs(value) >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
  if (Math.abs(value) >= 1_000) return `$${(value / 1_000).toFixed(0)}K`
  if (value % 1 !== 0) return value.toFixed(2)
  return String(value)
}

function formatPercent(rate: number): string {
  return `${(rate * 100).toFixed(1)}%`
}

export function ProjectionChart({ projection }: ProjectionChartProps) {
  const { title, method, data, growthRate, r2 } = projection

  // Find the label where projected data starts (first point with proyectado but no actual)
  const dividerLabel = data.find(
    (d) => d.proyectado !== undefined && d.actual === undefined
  )?.label

  const axisProps = {
    tick: { fill: '#64748B', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' },
    axisLine: { stroke: '#334155' },
    tickLine: false,
  }

  const gridProps = {
    strokeDasharray: '3 3',
    stroke: '#334155',
    strokeOpacity: 0.5,
  }

  return (
    <div className="mt-3 rounded-xl border border-acme-border bg-acme-slate/50 p-4">
      {/* Header */}
      <div className="flex items-start justify-between mb-3 gap-2">
        <p className="text-xs font-medium text-acme-muted font-display">{title}</p>
        <div className="flex flex-col items-end gap-0.5 shrink-0">
          {growthRate !== undefined && (
            <span className="text-[10px] font-mono text-acme-dim">
              CAGR {formatPercent(growthRate)}
            </span>
          )}
          {r2 !== undefined && (
            <span className="text-[10px] font-mono text-acme-dim">
              R² {r2.toFixed(3)}
            </span>
          )}
          <span className="text-[10px] text-acme-dim capitalize">
            Método: {method === 'linear' ? 'regresión lineal' : 'tasa de crecimiento'}
          </span>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={240}>
        <ComposedChart data={data} margin={{ top: 4, right: 8, left: 8, bottom: 4 }}>
          <CartesianGrid {...gridProps} />
          <XAxis dataKey="label" {...axisProps} />
          <YAxis {...axisProps} tickFormatter={formatValue} />

          {/* Vertical divider at start of projection */}
          {dividerLabel && (
            <ReferenceLine
              x={dividerLabel}
              stroke="#334155"
              strokeDasharray="4 2"
              label={{
                value: 'Proyección ›',
                position: 'insideTopRight',
                fill: '#64748B',
                fontSize: 10,
                fontFamily: 'JetBrains Mono, monospace',
              }}
            />
          )}

          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            formatter={(value: number, name: string) => [
              formatValue(value),
              name === 'actual' ? 'Real' : 'Proyectado',
            ]}
          />

          <Legend
            wrapperStyle={{ fontSize: 11, color: '#64748B', fontFamily: 'JetBrains Mono, monospace' }}
            formatter={(value) => (value === 'actual' ? 'Real' : 'Proyectado')}
          />

          {/* Historical bars */}
          <Bar
            dataKey="actual"
            fill="#0EA5E9"
            fillOpacity={0.75}
            radius={[3, 3, 0, 0]}
            name="actual"
          />

          {/* Projected line (dashed, gold) */}
          <Line
            type="monotone"
            dataKey="proyectado"
            stroke="#C9A84C"
            strokeWidth={2}
            strokeDasharray="6 3"
            dot={{ r: 4, fill: '#C9A84C', strokeWidth: 0 }}
            activeDot={{ r: 5 }}
            name="proyectado"
            connectNulls={false}
          />
        </ComposedChart>
      </ResponsiveContainer>

      {/* Disclaimer */}
      <p className="mt-2 text-[10px] text-acme-dim leading-relaxed">
        Las proyecciones son estimaciones estadísticas y no garantizan resultados futuros.
      </p>
    </div>
  )
}
