import { NextRequest } from 'next/server'
import type OpenAI from 'openai'
import { openai } from '@/lib/openai'
import { DASHI_SYSTEM_PROMPT } from '@/prompts/system'
import { MODELS } from '@/lib/constants'
import { DB_QUERY_TOOL, CHART_TOOL, PROJECTION_TOOL } from '@/lib/tools'
import { validateSQL } from '@/lib/sql-validator'
import { prisma } from '@/lib/db'
import { projectLinear, projectGrowthRate, linearRegression } from '@/lib/projections'
import type { ChartData, ProjectionData, ProjectionDataPoint } from '@/types'

type ChatMessage = OpenAI.Chat.ChatCompletionMessageParam

const JSON_REPLACER = (_key: string, value: unknown) =>
  typeof value === 'bigint' ? value.toString() : value

async function executeDBQuery(sql: string, explanation: string) {
  const validation = validateSQL(sql)
  if (!validation.valid) return { error: validation.error }

  try {
    const data = await prisma.$queryRawUnsafe(sql)
    return {
      success: true,
      explanation,
      data,
      rowCount: Array.isArray(data) ? data.length : 0,
    }
  } catch (err) {
    console.error('DB query error:', err)
    return { error: 'Error al ejecutar la consulta en la base de datos.' }
  }
}

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response('Mensajes inválidos.', { status: 400 })
    }

    const currentMessages: ChatMessage[] = [
      { role: 'system', content: DASHI_SYSTEM_PROMPT },
      ...messages,
    ]

    let pendingChart: ChartData | null = null
    let dbTableData: Record<string, unknown>[] | null = null
    let pendingProjection: ProjectionData | null = null

    // Agentic loop: keep processing tool rounds until GPT gives a plain response
    const MAX_ROUNDS = 6

    for (let round = 0; round < MAX_ROUNDS; round++) {
      const response = await openai.chat.completions.create({
        model: MODELS.chat,
        messages: currentMessages,
        tools: [DB_QUERY_TOOL, CHART_TOOL, PROJECTION_TOOL],
        tool_choice: 'auto',
        temperature: 0.4,
        max_tokens: 8192,
      })

      const assistantMsg = response.choices[0].message

      // No tool calls → GPT is ready to give the final answer.
      // Don't push it — the streaming call below will regenerate it word-by-word.
      if (!assistantMsg.tool_calls || assistantMsg.tool_calls.length === 0) {
        break
      }

      // Has tool calls → add to history and process
      currentMessages.push(assistantMsg as ChatMessage)

      // Process all tool calls in this round
      for (const toolCall of assistantMsg.tool_calls) {
        if (toolCall.type !== 'function') continue

        if (toolCall.function.name === 'query_database') {
          let content: string
          try {
            const args: { sql: string; explanation: string } = JSON.parse(toolCall.function.arguments)
            const result = await executeDBQuery(args.sql, args.explanation)

            if ('data' in result && Array.isArray(result.data) && result.data.length > 0) {
              dbTableData = result.data as Record<string, unknown>[]
            }

            content = JSON.stringify(result, JSON_REPLACER)
          } catch {
            content = JSON.stringify({ error: 'Argumentos inválidos.' })
          }

          currentMessages.push({ role: 'tool', tool_call_id: toolCall.id, content })
        }

        else if (toolCall.function.name === 'render_chart') {
          try {
            const args: {
              chart_type: string; title: string; data: string
              x_label?: string; y_label?: string
            } = JSON.parse(toolCall.function.arguments)

            const parsed = JSON.parse(args.data)
            pendingChart = {
              type: args.chart_type as ChartData['type'],
              title: args.title,
              data: parsed,
              xLabel: args.x_label,
              yLabel: args.y_label,
            }
          } catch {
            // malformed args — still need to push a tool result
          }

          currentMessages.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            content: JSON.stringify({ success: true }),
          })
        }

        else if (toolCall.function.name === 'project_data') {
          let content: string
          try {
            const args: {
              title: string
              historical_data: string
              future_labels: string
              method: 'linear' | 'growth_rate'
              periods: number
            } = JSON.parse(toolCall.function.arguments)

            const historicalPoints: { label: string; value: number }[] = JSON.parse(args.historical_data)
            const futureLabels: string[] = JSON.parse(args.future_labels)
            const values = historicalPoints.map((p) => Number(p.value))

            let projectedValues: number[]
            let growthRate: number | undefined
            let r2: number | undefined

            if (args.method === 'growth_rate') {
              const result = projectGrowthRate(values, args.periods)
              projectedValues = result.values
              growthRate = result.avgGrowthRate
            } else {
              projectedValues = projectLinear(values, args.periods)
              const reg = linearRegression(values)
              r2 = reg.r2
            }

            const projData: ProjectionDataPoint[] = [
              ...historicalPoints.map((p) => ({ label: p.label, actual: Number(p.value) })),
              ...futureLabels.slice(0, args.periods).map((label, i) => ({
                label,
                proyectado: projectedValues[i],
              })),
            ]

            pendingProjection = {
              title: args.title,
              method: args.method,
              data: projData,
              growthRate,
              r2,
            }

            content = JSON.stringify({
              success: true,
              projectedValues,
              method: args.method,
              growthRate,
              r2,
              message: `Proyección calculada: ${args.periods} períodos usando método ${args.method}.`,
            })
          } catch {
            content = JSON.stringify({ error: 'Error al calcular la proyección.' })
          }

          currentMessages.push({ role: 'tool', tool_call_id: toolCall.id, content })
        }

        else {
          // Unknown tool — respond with error so GPT doesn't hang
          currentMessages.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            content: JSON.stringify({ error: 'Herramienta no reconocida.' }),
          })
        }
      }
    }

    // Stream the final GPT response (after all tool rounds are complete)
    const finalStream = await openai.chat.completions.create({
      model: MODELS.chat,
      messages: currentMessages,
      temperature: 0.4,
      max_tokens: 2048,
      stream: true,
    })

    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        // Emit visualization data before the text stream
        if (pendingProjection) {
          const evt = { type: 'projection', projection: pendingProjection }
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(evt)}\n\n`))
        }

        if (pendingChart && !pendingProjection) {
          const evt = { type: 'chart', chart: pendingChart }
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(evt)}\n\n`))
        }

        if (dbTableData && !pendingProjection && !pendingChart) {
          const evt = { type: 'table', rows: dbTableData }
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(evt, JSON_REPLACER)}\n\n`))
        }

        for await (const chunk of finalStream) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`))
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()
      },
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return new Response('Error interno del servidor.', { status: 500 })
  }
}
