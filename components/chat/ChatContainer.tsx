'use client'

import { useState, useRef, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Message, ChatMode, ChartData, ProjectionData } from '@/types'
import { MessageBubble, ThinkingBubble } from './MessageBubble'
import { ChatInput } from './ChatInput'
import { VoiceButton } from '@/components/voice/VoiceButton'
import { UI_TEXT } from '@/lib/constants'
import { useVoice } from '@/hooks/useVoice'
import { useStreamingAudio } from '@/hooks/useStreamingAudio'

function generateId(): string {
  return Math.random().toString(36).slice(2)
}

export function ChatContainer() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [mode, setMode] = useState<ChatMode>('text')
  const bottomRef = useRef<HTMLDivElement>(null)

  const { voiceState, audioLevel, startListening, stopListening, resetVoice } = useVoice()
  const { isPlaying, play: playAudio, stop: stopAudio } = useStreamingAudio()

  useEffect(() => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: UI_TEXT.welcome,
        timestamp: new Date(),
      },
    ])
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isStreaming])

  async function handleSend(text: string) {
    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setIsStreaming(true)

    let assistantText = ''

    try {
      const history = [...messages, userMessage].map(({ role, content }) => ({ role, content }))

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
      })

      if (!response.ok) throw new Error('Error al contactar al servidor.')
      if (!response.body) throw new Error('Sin respuesta del servidor.')

      const assistantId = generateId()

      setMessages((prev) => [
        ...prev,
        { id: assistantId, role: 'assistant', content: '', timestamp: new Date() },
      ])

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6).trim()
          if (data === '[DONE]') break

          try {
            const parsed = JSON.parse(data)

            if (parsed.type === 'chart') {
              const chartData = parsed.chart as ChartData
              setMessages((prev) =>
                prev.map((m) => (m.id === assistantId ? { ...m, chartData } : m))
              )
              continue
            }

            if (parsed.type === 'table') {
              const tableData = parsed.rows as Record<string, unknown>[]
              setMessages((prev) =>
                prev.map((m) => (m.id === assistantId ? { ...m, tableData } : m))
              )
              continue
            }

            if (parsed.type === 'projection') {
              const projectionData = parsed.projection as ProjectionData
              setMessages((prev) =>
                prev.map((m) => (m.id === assistantId ? { ...m, projectionData } : m))
              )
              continue
            }

            const delta = parsed.choices?.[0]?.delta?.content ?? ''
            if (delta) {
              assistantText += delta
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId ? { ...m, content: assistantText } : m
                )
              )
            }
          } catch {
            // skip malformed SSE lines
          }
        }
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: generateId(),
          role: 'assistant',
          content: UI_TEXT.networkError,
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsStreaming(false)

      if (mode === 'voice' && assistantText) {
        try {
          await playAudio(assistantText)
        } catch {
          // TTS failed silently — text visible in chat
        }
      }

      if (mode === 'voice') resetVoice()
    }
  }

  async function handleVoicePress() {
    if (isPlaying) {
      stopAudio()
      return
    }
    if (voiceState === 'idle') {
      await startListening()
    } else if (voiceState === 'recording') {
      const text = await stopListening()
      if (text) await handleSend(text)
    }
  }

  function handleModeChange(newMode: ChatMode) {
    if (isPlaying) stopAudio()
    setMode(newMode)
  }

  const effectiveVoiceState = isPlaying ? 'speaking' : voiceState

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto flex flex-col gap-4">
          <AnimatePresence initial={false}>
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {isStreaming && messages[messages.length - 1]?.role !== 'assistant' && (
              <ThinkingBubble key="thinking" />
            )}
          </AnimatePresence>
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Disclaimer */}
      <div className="text-center px-4 py-1">
        <p className="text-xs text-acme-dim">{UI_TEXT.disclaimer}</p>
      </div>

      {/* Voice button */}
      {mode === 'voice' && (
        <div className="flex justify-center">
          <VoiceButton
            voiceState={effectiveVoiceState}
            audioLevel={audioLevel}
            onPress={handleVoicePress}
          />
        </div>
      )}

      {/* Input */}
      <div className="max-w-3xl mx-auto w-full">
        <ChatInput
          onSend={handleSend}
          disabled={isStreaming}
          mode={mode}
          onModeChange={handleModeChange}
        />
      </div>
    </div>
  )
}
