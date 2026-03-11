'use client'

import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { ChartData } from '@/types'

interface InlineChartProps {
  chart: ChartData
}

const COLORS = ['#0EA5E9', '#C9A84C', '#22C55E', '#EF4444', '#F59E0B', '#8B5CF6']

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
  if (value % 1 !== 0) return value.toFixed(4)
  return String(value)
}

export function InlineChart({ chart }: InlineChartProps) {
  const { type, title, data, xLabel, yLabel } = chart

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
      <p className="text-xs font-medium text-acme-muted mb-3 font-display">{title}</p>
      <ResponsiveContainer width="100%" height={220}>
        {type === 'bar' ? (
          <BarChart data={data} margin={{ top: 4, right: 8, left: 8, bottom: 4 }}>
            <CartesianGrid {...gridProps} />
            <XAxis dataKey="label" {...axisProps} label={xLabel ? { value: xLabel, position: 'insideBottom', offset: -2, fill: '#64748B', fontSize: 10 } : undefined} />
            <YAxis {...axisProps} tickFormatter={formatValue} label={yLabel ? { value: yLabel, angle: -90, position: 'insideLeft', fill: '#64748B', fontSize: 10 } : undefined} />
            <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [formatValue(Number(v)), '']} />
            {data[0] && Object.keys(data[0]).filter(k => k !== 'label').map((key, i) => (
              <Bar key={key} dataKey={key} fill={COLORS[i % COLORS.length]} radius={[3, 3, 0, 0]} />
            ))}
          </BarChart>
        ) : type === 'line' ? (
          <LineChart data={data} margin={{ top: 4, right: 8, left: 8, bottom: 4 }}>
            <CartesianGrid {...gridProps} />
            <XAxis dataKey="label" {...axisProps} />
            <YAxis {...axisProps} tickFormatter={formatValue} />
            <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [formatValue(Number(v)), '']} />
            {data[0] && Object.keys(data[0]).filter(k => k !== 'label').map((key, i) => (
              <Line key={key} type="monotone" dataKey={key} stroke={COLORS[i % COLORS.length]} strokeWidth={2} dot={{ r: 3, fill: COLORS[i % COLORS.length] }} />
            ))}
          </LineChart>
        ) : type === 'area' ? (
          <AreaChart data={data} margin={{ top: 4, right: 8, left: 8, bottom: 4 }}>
            <CartesianGrid {...gridProps} />
            <XAxis dataKey="label" {...axisProps} />
            <YAxis {...axisProps} tickFormatter={formatValue} />
            <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [formatValue(Number(v)), '']} />
            {data[0] && Object.keys(data[0]).filter(k => k !== 'label').map((key, i) => (
              <Area key={key} type="monotone" dataKey={key} stroke={COLORS[i % COLORS.length]} fill={COLORS[i % COLORS.length]} fillOpacity={0.1} strokeWidth={2} />
            ))}
          </AreaChart>
        ) : (
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="label" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`} labelLine={{ stroke: '#334155' }}>
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [formatValue(Number(v)), '']} />
            <Legend wrapperStyle={{ fontSize: 11, color: '#64748B', fontFamily: 'JetBrains Mono, monospace' }} />
          </PieChart>
        )}
      </ResponsiveContainer>
    </div>
  )
}
