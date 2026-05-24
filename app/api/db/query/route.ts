import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { validateSQL } from '@/lib/sql-validator'

const JSON_REPLACER = (_key: string, value: unknown) =>
  typeof value === 'bigint' ? value.toString() : value

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body, JSON_REPLACER), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function POST(req: NextRequest) {
  try {
    const { sql, explanation } = await req.json()

    if (!sql || typeof sql !== 'string') {
      return jsonResponse({ error: 'Consulta SQL requerida.' }, 400)
    }

    const validation = validateSQL(sql)
    if (!validation.valid) {
      return jsonResponse({ error: validation.error }, 400)
    }

    const results = await prisma.$queryRawUnsafe(sql)

    return jsonResponse({
      success: true,
      explanation,
      data: results,
      rowCount: Array.isArray(results) ? results.length : 0,
    })
  } catch (error) {
    console.error('Database query error:', error)
    return jsonResponse({ error: 'Error al ejecutar la consulta en la base de datos.' }, 500)
  }
}
