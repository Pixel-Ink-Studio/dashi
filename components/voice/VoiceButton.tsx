'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, Loader2, Volume2 } from 'lucide-react'
import { VoiceState } from '@/types'
import { UI_TEXT } from '@/lib/constants'

interface VoiceButtonProps {
  voiceState: VoiceState
  audioLevel: number
  onPress: () => void
}

const STATE_LABELS: Record<VoiceState, string> = {
  idle: UI_TEXT.voicePrompt,
  recording: UI_TEXT.recording,
  transcribing: UI_TEXT.transcribing,
  thinking: UI_TEXT.thinking,
  speaking: UI_TEXT.speaking,
}

export function VoiceButton({ voiceState, audioLevel, onPress }: VoiceButtonProps) {
  const isRecording = voiceState === 'recording'
  const isBusy = voiceState === 'transcribing' || voiceState === 'thinking'
  const isSpeaking = voiceState === 'speaking'

  return (
    <div className="flex flex-col items-center gap-4 py-6">
      {/* Waveform bars behind button when recording */}
      <div className="relative flex items-center justify-center">
        {/* Animated ring */}
        <AnimatePresence>
          {isRecording && (
            <motion.div
              key="ring"
              className="absolute rounded-full border-2 border-red-500"
              initial={{ width: 80, height: 80, opacity: 0.8 }}
              animate={{
                width: 80 + audioLevel * 40,
                height: 80 + audioLevel * 40,
                opacity: 0.4 + audioLevel * 0.4,
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
            />
          )}
          {isSpeaking && (
            <motion.div
              key="speak-ring"
              className="absolute rounded-full border-2 border-acme-gold"
              animate={{ width: [80, 96, 80], height: [80, 96, 80], opacity: [0.5, 0.2, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            />
          )}
        </AnimatePresence>

        {/* Main button */}
        <button
          onClick={onPress}
          disabled={isBusy}
          className={`relative z-10 flex h-16 w-16 items-center justify-center rounded-full transition-colors disabled:cursor-not-allowed ${
            isRecording
              ? 'bg-red-500 hover:bg-red-600'
              : isSpeaking
              ? 'bg-acme-gold hover:bg-acme-gold-dim'
              : 'bg-acme-slate border-2 border-acme-gold hover:border-acme-gold-dim'
          }`}
          aria-label={STATE_LABELS[voiceState]}
        >
          {isBusy ? (
            <Loader2 size={24} className="animate-spin text-acme-muted" />
          ) : isRecording ? (
            <MicOff size={24} className="text-white" />
          ) : isSpeaking ? (
            <Volume2 size={24} className="text-acme-navy" />
          ) : (
            <Mic size={24} className="text-acme-gold" />
          )}
        </button>
      </div>

      {/* Label */}
      <AnimatePresence mode="wait">
        <motion.p
          key={voiceState}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2 }}
          className="text-xs text-acme-muted"
        >
          {STATE_LABELS[voiceState]}
        </motion.p>
      </AnimatePresence>

      {/* Waveform bars (recording only) */}
      {isRecording && (
        <div className="flex items-end gap-0.5 h-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <motion.div
              key={i}
              className="w-1 rounded-full bg-red-500"
              animate={{
                height: [4, 4 + audioLevel * 20 * Math.sin(i * 0.8 + Date.now() / 300), 4],
              }}
              transition={{ duration: 0.3, repeat: Infinity, delay: i * 0.05 }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
