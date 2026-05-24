'use client'

import { TransitionMatrixData } from '@/types'
import { generateMatrixHtml } from '@/lib/matrixHtml'

interface TransitionMatrixProps {
  data: TransitionMatrixData
}

const STATE_LABELS: Record<number, string> = {
  0: 'Al corriente',
  1: '1–30 días',
  2: '31–60 días',
  3: '61–90 días',
  4: '91–120 días',
  5: '121+ días',
}

function getCellBackground(fromState: number, toState: number, pct: number): string {
  if (pct === 0) return 'transparent'
  const intensity = Math.min(pct / 100, 1)
  if (fromState === toState) return `rgba(100, 149, 237, ${0.12 + intensity * 0.68})`
  if (toState > fromState) return `rgba(239, 68, 68, ${0.08 + intensity * 0.75})`
  return `rgba(34, 197, 94, ${0.08 + intensity * 0.75})`
}

function getCellTextColor(fromState: number, toState: number, pct: number, maxPct: number): string {
  if (pct === 0) return '#4b5563'
  if (pct / maxPct > 0.5) return '#ffffff'
  if (fromState === toState) return '#93c5fd'
  if (toState > fromState) return '#fca5a5'
  return '#86efac'
}

function openInNewTab(data: TransitionMatrixData) {
  const html = generateMatrixHtml(data)
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  window.open(url, '_blank', 'noopener')
  setTimeout(() => URL.revokeObjectURL(url), 60_000)
}

export function TransitionMatrix({ data }: TransitionMatrixProps) {
  const { title, states, cells } = data

  const lookup = new Map<string, { count: number; pct: number }>()
  for (const cell of cells) {
    lookup.set(`${cell.fromState}-${cell.toState}`, { count: cell.count, pct: Number(cell.pct) })
  }

  const maxPct = Math.max(...cells.map((c) => Number(c.pct)))
  const totalTransitions = cells.reduce((s, c) => s + c.count, 0)

  return (
    <div className="mt-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <p className="text-xs font-semibold text-acme-gold">{title}</p>
          <p className="text-[10px] text-acme-dim mt-0.5">
            {totalTransitions.toLocaleString('es-MX')} transiciones · vista previa (% de transición)
          </p>
        </div>
        <button
          onClick={() => openInNewTab(data)}
          className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-acme-gold/40 bg-acme-gold/10 text-acme-gold text-[11px] font-medium hover:bg-acme-gold/20 transition-colors"
        >
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 1h4v4M11 1L6 6M5 2H2a1 1 0 00-1 1v7a1 1 0 001 1h7a1 1 0 001-1V8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Análisis completo
        </button>
      </div>

      {/* Inline preview table (pct only) */}
      <div className="overflow-x-auto">
        <table className="text-xs border-collapse" style={{ minWidth: 'max-content' }}>
          <thead>
            <tr>
              <th
                className="px-2 py-1.5 text-right font-normal text-acme-dim border-b border-r border-acme-border/30"
                style={{ minWidth: 88 }}
              >
                De ↓ / A →
              </th>
              {states.map((s) => (
                <th
                  key={s}
                  className="px-2 py-1.5 text-center font-semibold border-b border-acme-border/30"
                  style={{ minWidth: 72 }}
                >
                  <span className="block text-acme-gold/90">Cub. {s}</span>
                  <span className="block text-[10px] font-normal text-acme-dim mt-0.5">{STATE_LABELS[s]}</span>
                </th>
              ))}
              <th className="px-2 py-1.5 text-center font-semibold text-acme-muted border-b border-l border-acme-border/30">
                n
              </th>
            </tr>
          </thead>
          <tbody>
            {states.map((fromState) => {
              const rowCells = cells.filter((c) => c.fromState === fromState)
              const rowTotal = rowCells.reduce((sum, c) => sum + c.count, 0)
              return (
                <tr key={fromState} className="border-b border-acme-border/20 last:border-0">
                  <td className="px-2 py-1.5 text-right border-r border-acme-border/30">
                    <span className="font-semibold text-acme-gold/80">Cub. {fromState}</span>
                    <span className="block text-[10px] text-acme-dim">{STATE_LABELS[fromState]}</span>
                  </td>
                  {states.map((toState) => {
                    const cell = lookup.get(`${fromState}-${toState}`)
                    const pct = cell?.pct ?? 0
                    return (
                      <td
                        key={toState}
                        className="px-2 py-1.5 text-center font-mono tabular-nums border border-acme-border/15"
                        style={{
                          backgroundColor: getCellBackground(fromState, toState, pct),
                          color: getCellTextColor(fromState, toState, pct, maxPct),
                        }}
                      >
                        {pct > 0 ? `${Number(pct).toFixed(1)}%` : '—'}
                      </td>
                    )
                  })}
                  <td className="px-2 py-1.5 text-center text-acme-dim text-[10px] border-l border-acme-border/30 tabular-nums">
                    {rowTotal > 0 ? rowTotal.toLocaleString('es-MX') : '—'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex gap-4 mt-2">
        {[
          { color: 'rgba(100,149,237,0.55)', label: 'Sin cambio' },
          { color: 'rgba(34,197,94,0.55)', label: 'Recuperación' },
          { color: 'rgba(239,68,68,0.55)', label: 'Deterioro' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1">
            <span className="inline-block w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: color }} />
            <span className="text-[10px] text-acme-dim">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
