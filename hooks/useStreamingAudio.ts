'use client'

import { useState, useRef, useCallback } from 'react'

export function useStreamingAudio() {
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const mediaSourceRef = useRef<MediaSource | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const play = useCallback(async (text: string): Promise<void> => {
    setIsPlaying(true)

    // Cancel any previous request
    abortRef.current?.abort()
    const abort = new AbortController()
    abortRef.current = abort

    try {
      const response = await fetch('/api/voice/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
        signal: abort.signal,
      })

      if (!response.ok || !response.body) throw new Error('TTS failed')

      const mimeType = 'audio/mpeg'
      const supportsMediaSource =
        typeof MediaSource !== 'undefined' && MediaSource.isTypeSupported(mimeType)

      if (supportsMediaSource) {
        // Streaming path: playback begins as first chunks arrive
        await playWithMediaSource(response.body, mimeType, abort.signal)
      } else {
        // Fallback: download full blob then play
        await playWithBlob(response)
      }
    } catch (error) {
      if ((error as Error).name === 'AbortError') return
      console.error('Audio playback error:', error)
    } finally {
      setIsPlaying(false)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const playWithMediaSource = useCallback(
    (body: ReadableStream<Uint8Array>, mimeType: string, signal: AbortSignal) => {
      return new Promise<void>((resolve, reject) => {
        const mediaSource = new MediaSource()
        mediaSourceRef.current = mediaSource
        const audioUrl = URL.createObjectURL(mediaSource)
        const audio = new Audio(audioUrl)
        audioRef.current = audio

        const cleanup = () => {
          URL.revokeObjectURL(audioUrl)
        }

        audio.addEventListener('ended', () => { cleanup(); resolve() }, { once: true })
        audio.addEventListener('error', () => { cleanup(); reject(new Error('Audio error')) }, { once: true })

        signal.addEventListener('abort', () => {
          audio.pause()
          cleanup()
          resolve()
        }, { once: true })

        mediaSource.addEventListener('sourceopen', async () => {
          let sourceBuffer: SourceBuffer
          try {
            sourceBuffer = mediaSource.addSourceBuffer(mimeType)
          } catch {
            reject(new Error('SourceBuffer creation failed'))
            return
          }

          const queue: Uint8Array[] = []
          let streamDone = false
          let hasStartedPlaying = false

          const tryAppend = () => {
            if (sourceBuffer.updating || queue.length === 0) return
            sourceBuffer.appendBuffer(queue.shift()!)
          }

          sourceBuffer.addEventListener('updateend', () => {
            // Start playing as soon as we have any buffered data
            if (!hasStartedPlaying && sourceBuffer.buffered.length > 0) {
              hasStartedPlaying = true
              audio.play().catch(reject)
            }

            if (queue.length > 0) {
              tryAppend()
            } else if (streamDone && mediaSource.readyState === 'open') {
              mediaSource.endOfStream()
            }
          })

          // Pump the fetch response stream into the SourceBuffer
          const reader = body.getReader()
          try {
            while (true) {
              if (signal.aborted) break
              const { done, value } = await reader.read()
              if (done) {
                streamDone = true
                // If nothing is pending, end the stream now
                if (!sourceBuffer.updating && queue.length === 0 && mediaSource.readyState === 'open') {
                  mediaSource.endOfStream()
                }
                break
              }
              queue.push(new Uint8Array(value))
              tryAppend()
            }
          } catch (err) {
            if ((err as Error).name !== 'AbortError') reject(err)
          }
        }, { once: true })
      })
    },
    []
  )

  const playWithBlob = useCallback(async (response: Response) => {
    const audioBlob = await response.blob()
    const audioUrl = URL.createObjectURL(audioBlob)
    const audio = new Audio(audioUrl)
    audioRef.current = audio

    await new Promise<void>((resolve, reject) => {
      audio.addEventListener('ended', () => { URL.revokeObjectURL(audioUrl); resolve() }, { once: true })
      audio.addEventListener('error', () => { URL.revokeObjectURL(audioUrl); reject(new Error('Audio error')) }, { once: true })
      audio.play().catch(reject)
    })
  }, [])

  const stop = useCallback(() => {
    abortRef.current?.abort()
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      audioRef.current = null
    }
    if (mediaSourceRef.current?.readyState === 'open') {
      try { mediaSourceRef.current.endOfStream() } catch { /* ignore */ }
    }
    setIsPlaying(false)
  }, [])

  return { isPlaying, play, stop }
}
