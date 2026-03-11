'use client'

import { useState, useRef, KeyboardEvent } from 'react'
import { Send } from 'lucide-react'
import { ChatMode } from '@/types'
import { UI_TEXT } from '@/lib/constants'
import { ModeToggle } from '@/components/voice/ModeToggle'

interface ChatInputProps {
  onSend: (text: string) => void
  disabled: boolean
  mode: ChatMode
  onModeChange: (mode: ChatMode) => void
}

export function ChatInput({ onSend, disabled, mode, onModeChange }: ChatInputProps) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function handleSend() {
    const text = value.trim()
    if (!text || disabled) return
    onSend(text)
    setValue('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  function handleInput() {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`
  }

  return (
    <div className="border-t border-acme-border bg-acme-navy px-4 pt-3 pb-4 space-y-3">
      <div className="flex justify-center">
        <ModeToggle mode={mode} onChange={onModeChange} />
      </div>

      {mode === 'text' && (
        <div className="flex items-end gap-3">
          <div className="flex-1 flex items-end gap-2 bg-acme-slate border border-acme-border rounded-xl px-4 py-2.5 focus-within:border-acme-gold transition-colors">
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onInput={handleInput}
              placeholder={UI_TEXT.placeholder}
              disabled={disabled}
              rows={1}
              className="flex-1 bg-transparent text-acme-white placeholder:text-acme-dim text-sm resize-none outline-none leading-relaxed max-h-40 disabled:opacity-50"
            />
          </div>
          <button
            onClick={handleSend}
            disabled={disabled || !value.trim()}
            className="h-10 w-10 flex items-center justify-center rounded-xl bg-acme-gold text-acme-navy hover:bg-acme-gold-dim disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0"
            aria-label={UI_TEXT.send}
          >
            <Send size={16} />
          </button>
        </div>
      )}
    </div>
  )
}
