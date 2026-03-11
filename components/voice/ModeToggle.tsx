'use client'

import { motion } from 'framer-motion'
import { Keyboard, Mic } from 'lucide-react'
import { ChatMode } from '@/types'
import { UI_TEXT } from '@/lib/constants'

interface ModeToggleProps {
  mode: ChatMode
  onChange: (mode: ChatMode) => void
}

export function ModeToggle({ mode, onChange }: ModeToggleProps) {
  return (
    <div className="flex items-center gap-1 p-0.5 rounded-lg bg-acme-slate border border-acme-border">
      {(['text', 'voice'] as const).map((m) => (
        <button
          key={m}
          onClick={() => onChange(m)}
          className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
        >
          {mode === m && (
            <motion.div
              layoutId="mode-pill"
              className="absolute inset-0 rounded-md bg-acme-gold"
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          )}
          <span className={`relative flex items-center gap-1.5 ${mode === m ? 'text-acme-navy' : 'text-acme-muted'}`}>
            {m === 'text' ? <Keyboard size={13} /> : <Mic size={13} />}
            {m === 'text' ? UI_TEXT.textMode : UI_TEXT.voiceMode}
          </span>
        </button>
      ))}
    </div>
  )
}
