'use client'

import { useState } from 'react'
import { ChevronUp, ChevronDown, Download } from 'lucide-react'

interface DataTableProps {
  data: Record<string, unknown>[]
  title?: string
}

function formatCell(value: unknown): string {
  if (value === null || value === undefined) return '—'
  if (typeof value === 'number') {
    if (Math.abs(value) >= 1_000_000) return `$${value.toLocaleString('es-MX')}`
    return value.toLocaleString('es-MX', { maximumFractionDigits: 4 })
  }
  if (typeof value === 'string' && !isNaN(Number(value)) && value.trim() !== '') {
    const n = Number(value)
    if (Math.abs(n) >= 1_000_000) return `$${n.toLocaleString('es-MX')}`
    return n.toLocaleString('es-MX', { maximumFractionDigits: 4 })
  }
  if (value instanceof Date) return value.toLocaleDateString('es-MX')
  return String(value)
}

function isNumericKey(data: Record<string, unknown>[], key: string): boolean {
  return data.some((row) => {
    const v = row[key]
    return typeof v === 'number' || (typeof v === 'string' && !isNaN(Number(v)) && v.trim() !== '')
  })
}

function exportCSV(data: Record<string, unknown>[], columns: string[]) {
  const header = columns.join(',')
  const rows = data.map((row) => columns.map((col) => JSON.stringify(row[col] ?? '')).join(','))
  const csv = [header, ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'datos.csv'
  a.click()
  URL.revokeObjectURL(url)
}

export function DataTable({ data, title }: DataTableProps) {
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  if (!data || data.length === 0) return null

  const columns = Object.keys(data[0])

  const sorted = sortKey
    ? [...data].sort((a, b) => {
        const av = a[sortKey]
        const bv = b[sortKey]
        const an = Number(av)
        const bn = Number(bv)
        if (!isNaN(an) && !isNaN(bn)) return sortDir === 'asc' ? an - bn : bn - an
        return sortDir === 'asc'
          ? String(av).localeCompare(String(bv))
          : String(bv).localeCompare(String(av))
      })
    : data

  function toggleSort(key: string) {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortKey(key); setSortDir('asc') }
  }

  return (
    <div className="mt-3 rounded-xl border border-acme-border overflow-hidden">
      {title && (
        <div className="flex items-center justify-between px-4 py-2 bg-acme-slate border-b border-acme-border">
          <p className="text-xs font-medium text-acme-muted font-display">{title}</p>
          <button
            onClick={() => exportCSV(sorted, columns)}
            className="flex items-center gap-1 text-xs text-acme-dim hover:text-acme-muted transition-colors"
          >
            <Download size={12} /> CSV
          </button>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-acme-slate border-b border-acme-border">
              {columns.map((col) => (
                <th
                  key={col}
                  onClick={() => toggleSort(col)}
                  className="px-3 py-2 text-left text-acme-muted uppercase tracking-wider font-medium cursor-pointer hover:text-acme-white select-none whitespace-nowrap"
                >
                  <span className="flex items-center gap-1">
                    {col}
                    {sortKey === col ? (
                      sortDir === 'asc' ? <ChevronUp size={10} /> : <ChevronDown size={10} />
                    ) : null}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, i) => (
              <tr
                key={i}
                className={`border-b border-acme-border/50 hover:bg-acme-slate/40 transition-colors ${i % 2 === 0 ? 'bg-acme-navy/30' : ''}`}
              >
                {columns.map((col) => (
                  <td
                    key={col}
                    className={`px-3 py-2 text-acme-white font-mono whitespace-nowrap ${
                      isNumericKey(data, col) ? 'text-right text-acme-teal' : ''
                    }`}
                  >
                    {formatCell(row[col])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-1.5 bg-acme-slate/30 border-t border-acme-border/50">
        <p className="text-[10px] text-acme-dim">{sorted.length} fila{sorted.length !== 1 ? 's' : ''}</p>
      </div>
    </div>
  )
}
