'use client'

import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
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

function MarkdownContent({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
        strong: ({ children }) => <strong className="font-semibold text-acme-gold">{children}</strong>,
        em: ({ children }) => <em className="italic text-acme-muted">{children}</em>,
        h1: ({ children }) => <h1 className="text-base font-bold text-acme-gold mt-3 mb-1 first:mt-0">{children}</h1>,
        h2: ({ children }) => <h2 className="text-sm font-bold text-acme-gold mt-3 mb-1 first:mt-0">{children}</h2>,
        h3: ({ children }) => <h3 className="text-sm font-semibold text-acme-muted mt-2 mb-1 first:mt-0">{children}</h3>,
        ul: ({ children }) => <ul className="list-disc list-inside space-y-0.5 my-1.5 pl-1">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal list-inside space-y-0.5 my-1.5 pl-1">{children}</ol>,
        li: ({ children }) => <li className="text-sm leading-relaxed">{children}</li>,
        code: ({ children, className }) => {
          const isBlock = className?.includes('language-')
          return isBlock ? (
            <code className="block bg-acme-navy rounded-lg px-3 py-2 text-xs font-mono my-2 overflow-x-auto">{children}</code>
          ) : (
            <code className="bg-acme-navy rounded px-1.5 py-0.5 text-xs font-mono text-acme-gold">{children}</code>
          )
        },
        pre: ({ children }) => <pre className="my-2">{children}</pre>,
        blockquote: ({ children }) => (
          <blockquote className="border-l-2 border-acme-gold pl-3 my-2 text-acme-muted italic">{children}</blockquote>
        ),
        table: ({ children }) => (
          <div className="overflow-x-auto my-3">
            <table className="w-full text-xs border-collapse">{children}</table>
          </div>
        ),
        thead: ({ children }) => <thead>{children}</thead>,
        tbody: ({ children }) => <tbody>{children}</tbody>,
        tr: ({ children }) => (
          <tr className="border-b border-acme-border last:border-0">{children}</tr>
        ),
        th: ({ children }) => (
          <th className="text-left px-3 py-2 font-semibold text-acme-gold bg-acme-navy/60 whitespace-nowrap">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="px-3 py-1.5 text-acme-white/90">{children}</td>
        ),
        hr: () => <hr className="border-acme-border my-3" />,
      }}
    >
      {content}
    </ReactMarkdown>
  )
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
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed w-full ${
            isUser
              ? 'bg-user-bubble text-acme-white rounded-tr-sm whitespace-pre-wrap'
              : 'bg-dashi-bubble text-acme-white rounded-tl-sm border border-acme-border'
          }`}
        >
          {isUser ? (
            message.content
          ) : (
            <MarkdownContent content={message.content} />
          )}

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
