import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { validateSQL } from '@/lib/sql-validator'

export async function POST(req: NextRequest) {
  try {
    const { sql, explanation } = await req.json()

    if (!sql || typeof sql !== 'string') {
      return NextResponse.json({ error: 'Consulta SQL requerida.' }, { status: 400 })
    }

    const validation = validateSQL(sql)
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    const results = await prisma.$queryRawUnsafe(sql)

    return NextResponse.json({
      success: true,
      explanation,
      data: results,
      rowCount: Array.isArray(results) ? results.length : 0,
    })
  } catch (error) {
    console.error('Database query error:', error)
    return NextResponse.json(
      { error: 'Error al ejecutar la consulta en la base de datos.' },
      { status: 500 }
    )
  }
}
