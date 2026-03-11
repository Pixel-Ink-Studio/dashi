import { NextRequest } from 'next/server'
import { openai } from '@/lib/openai'
import { DASHI_VOICE_INSTRUCTIONS, DASHI_VOICE_CONFIG } from '@/prompts/voice-instructions'

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json()

    if (!text || typeof text !== 'string') {
      return new Response('Texto requerido.', { status: 400 })
    }

    const response = await openai.audio.speech.create({
      model: DASHI_VOICE_CONFIG.model,
      voice: DASHI_VOICE_CONFIG.voice,
      input: text,
      instructions: DASHI_VOICE_INSTRUCTIONS,
      response_format: DASHI_VOICE_CONFIG.response_format,
    })

    return new Response(response.body, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Transfer-Encoding': 'chunked',
      },
    })
  } catch (error) {
    console.error('TTS error:', error)
    return new Response('Error al generar audio.', { status: 500 })
  }
}
