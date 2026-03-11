'use client'

import { motion } from 'framer-motion'
import { Message } from '@/types'
import { UI_TEXT } from '@/lib/constants'
import { InlineChart } from '@/components/data/InlineChart'
import { DataTable } from '@/components/data/DataTable'
import { ProjectionChart } from '@/components/data/ProjectionChart'

interface MessageBubbleProps {
  message: Message
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user'

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`flex flex-col gap-1 max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Sender + timestamp */}
        <div className={`flex items-center gap-2 px-1 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
          <span className="text-xs font-medium text-acme-muted">
            {isUser ? UI_TEXT.you : UI_TEXT.dashi}
          </span>
          <span className="text-xs text-acme-dim">{formatTime(message.timestamp)}</span>
        </div>

        {/* Bubble */}
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap w-full ${
            isUser
              ? 'bg-user-bubble text-acme-white rounded-tr-sm'
              : 'bg-dashi-bubble text-acme-white rounded-tl-sm border border-acme-border'
          }`}
        >
          {message.content}

          {!isUser && message.projectionData && (
            <ProjectionChart projection={message.projectionData} />
          )}

          {!isUser && message.chartData && !message.projectionData && (
            <InlineChart chart={message.chartData} />
          )}

          {!isUser && message.tableData && message.tableData.length > 0 &&
            !message.chartData && !message.projectionData && (
            <DataTable data={message.tableData} />
          )}
        </div>
      </div>
    </motion.div>
  )
}

export function ThinkingBubble() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="flex justify-start"
    >
      <div className="flex flex-col gap-1 items-start">
        <span className="text-xs font-medium text-acme-muted px-1">{UI_TEXT.dashi}</span>
        <div className="bg-dashi-bubble border border-acme-border rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="h-1.5 w-1.5 rounded-full bg-acme-muted"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  )
}
