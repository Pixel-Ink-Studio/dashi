'use client'

import { useState, useCallback } from 'react'
import { useAudioRecorder } from './useAudioRecorder'
import { VoiceState } from '@/types'
import { UI_TEXT } from '@/lib/constants'

interface UseVoiceReturn {
  voiceState: VoiceState
  audioLevel: number
  startListening: () => Promise<void>
  stopListening: () => Promise<string | null>
  resetVoice: () => void
}

export function useVoice(): UseVoiceReturn {
  const [voiceState, setVoiceState] = useState<VoiceState>('idle')
  const { startRecording, stopRecording, audioLevel } = useAudioRecorder()

  const startListening = useCallback(async () => {
    try {
      await startRecording()
      setVoiceState('recording')
    } catch {
      alert(UI_TEXT.micPermissionDenied)
      setVoiceState('idle')
    }
  }, [startRecording])

  const stopListening = useCallback(async (): Promise<string | null> => {
    setVoiceState('transcribing')
    const audioBlob = await stopRecording()

    if (!audioBlob) {
      setVoiceState('idle')
      return null
    }

    try {
      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.webm')

      const res = await fetch('/api/voice/transcribe', {
        method: 'POST',
        body: formData,
      })

      const json = await res.json()
      if (!json.text) {
        setVoiceState('idle')
        return null
      }

      setVoiceState('thinking')
      return json.text as string
    } catch {
      setVoiceState('idle')
      return null
    }
  }, [stopRecording])

  const resetVoice = useCallback(() => setVoiceState('idle'), [])

  return { voiceState, audioLevel, startListening, stopListening, resetVoice }
}
