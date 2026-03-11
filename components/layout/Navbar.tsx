'use client'

import { UI_TEXT } from '@/lib/constants'

export function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-acme-border bg-acme-navy/95 backdrop-blur-sm">
      <div className="flex h-full items-center justify-between px-6">
        {/* Left: Brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-acme-gold text-acme-navy font-bold text-sm font-mono">
            D
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-acme-muted leading-none">{UI_TEXT.brandName}</span>
            <span className="text-sm font-semibold text-acme-gold leading-tight font-display">
              {UI_TEXT.appName}
            </span>
          </div>
        </div>

        {/* Right: Status indicator */}
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-acme-green animate-pulse" />
          <span className="text-xs text-acme-muted">En línea</span>
        </div>
      </div>
    </header>
  )
}
