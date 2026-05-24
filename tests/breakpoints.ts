/**
 * Dashi Breakpoint Tests
 * Run: npx tsx tests/breakpoints.ts
 * Requires dev server running on localhost:3000
 */

const BASE_URL = 'http://localhost:3000'

// ─── Types ────────────────────────────────────────────────────────────────────

const DELAY_BETWEEN_TESTS_MS = 1500

interface DebugEntry {
  round: number
  tool: string
  sql?: string
  explanation?: string
  rowCount?: number
  error?: string
}

interface StreamResult {
  text: string
  debug: DebugEntry[]
  usedTools: string[]
  toolsPerRound: Record<number, string[]>
  hasTable: boolean
  hasChart: boolean
  hasProjection: boolean
  error?: string
}

interface TestCase {
  id: string
  name: string
  messages: { role: 'user' | 'assistant'; content: string }[]
  checks: Check[]
}

interface Check {
  name: string
  fn: (result: StreamResult) => boolean
  critical: boolean
}

// ─── SSE Parser ───────────────────────────────────────────────────────────────

async function sendChat(
  messages: { role: 'user' | 'assistant'; content: string }[]
): Promise<StreamResult> {
  const res = await fetch(`${BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, _debug: true }),
  })

  const empty: StreamResult = { text: '', debug: [], usedTools: [], toolsPerRound: {}, hasTable: false, hasChart: false, hasProjection: false }
  if (!res.ok) return { ...empty, error: `HTTP ${res.status}` }
  if (!res.body) return { ...empty, error: 'No body' }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let text = ''
  const debug: DebugEntry[] = []
  const usedTools = new Set<string>()
  const toolsPerRound: Record<number, string[]> = {}
  let hasTable = false
  let hasChart = false
  let hasProjection = false

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    const chunk = decoder.decode(value, { stream: true })
    for (const line of chunk.split('\n')) {
      if (!line.startsWith('data: ')) continue
      const data = line.slice(6).trim()
      if (data === '[DONE]') break
      try {
        const parsed = JSON.parse(data)
        if (parsed.type === 'debug') {
          for (const entry of parsed.log as DebugEntry[]) {
            debug.push(entry)
            usedTools.add(entry.tool)
            toolsPerRound[entry.round] = [...(toolsPerRound[entry.round] ?? []), entry.tool]
          }
        } else if (parsed.type === 'table') {
          hasTable = true
        } else if (parsed.type === 'chart') {
          hasChart = true
        } else if (parsed.type === 'projection') {
          hasProjection = true
        } else {
          const delta = parsed.choices?.[0]?.delta?.content ?? ''
          if (delta) text += delta
        }
      } catch { /* skip malformed lines */ }
    }
  }

  return { text, debug, usedTools: [...usedTools], toolsPerRound, hasTable, hasChart, hasProjection }
}

// ─── Test Cases ───────────────────────────────────────────────────────────────

const TESTS: TestCase[] = [
  {
    id: 'T01',
    name: 'Query básica: conteo de clientes activos',
    messages: [{ role: 'user', content: '¿Cuántos clientes activos hay?' }],
    checks: [
      {
        name: 'Consulta la BD (no alucina)',
        fn: (r) => r.usedTools.includes('query_database'),
        critical: true,
      },
      {
        name: 'SQL tiene tabla Client',
        fn: (r) => r.debug.some((d) => d.sql?.includes('Client')),
        critical: true,
      },
      {
        name: 'La query no falló',
        fn: (r) => r.debug.every((d) => !d.error),
        critical: true,
      },
      {
        name: 'Respuesta contiene un número',
        fn: (r) => /\d+/.test(r.text),
        critical: false,
      },
    ],
  },
  {
    id: 'T02',
    name: 'Query básica: ingresos totales 2024',
    messages: [{ role: 'user', content: '¿Cuáles son los ingresos totales de 2024?' }],
    checks: [
      {
        name: 'Consulta la BD',
        fn: (r) => r.usedTools.includes('query_database'),
        critical: true,
      },
      {
        name: 'SQL tiene tabla Revenue',
        fn: (r) => r.debug.some((d) => d.sql?.toLowerCase().includes('revenue')),
        critical: true,
      },
      {
        name: 'SQL filtra por año 2024',
        fn: (r) => r.debug.some((d) => d.sql?.includes('2024')),
        critical: false,
      },
      {
        name: 'La query no falló',
        fn: (r) => r.debug.every((d) => !d.error),
        critical: true,
      },
    ],
  },
  {
    id: 'T03',
    name: 'sabana_tdc_riesgos: conteo de tarjetas',
    messages: [{ role: 'user', content: '¿Cuántas tarjetas hay en la sábana de riesgos?' }],
    checks: [
      {
        name: 'Consulta la BD',
        fn: (r) => r.usedTools.includes('query_database'),
        critical: true,
      },
      {
        name: 'SQL referencia sabana_tdc_riesgos',
        fn: (r) => r.debug.some((d) => d.sql?.includes('sabana_tdc_riesgos')),
        critical: true,
      },
      {
        name: 'La query no falló',
        fn: (r) => r.debug.every((d) => !d.error),
        critical: true,
      },
      {
        name: 'Respuesta contiene un número',
        fn: (r) => /\d[\d,]+/.test(r.text),
        critical: false,
      },
    ],
  },
  {
    id: 'T04',
    name: 'sabana_tdc_riesgos: consulta de morosidad',
    messages: [{ role: 'user', content: '¿Cuántas tarjetas están en mora (dpd > 0)?' }],
    checks: [
      {
        name: 'Consulta la BD',
        fn: (r) => r.usedTools.includes('query_database'),
        critical: true,
      },
      {
        name: 'SQL usa condición sobre dpd',
        fn: (r) => r.debug.some((d) => d.sql?.includes('dpd')),
        critical: true,
      },
      {
        name: 'La query no falló',
        fn: (r) => r.debug.every((d) => !d.error),
        critical: true,
      },
    ],
  },
  {
    id: 'T05',
    name: 'No anuncia antes de ejecutar: responde directo',
    messages: [{ role: 'user', content: '¿Cuántos clientes tenemos en total?' }],
    checks: [
      {
        name: 'Llama query_database (no solo anuncia)',
        fn: (r) => r.usedTools.includes('query_database'),
        critical: true,
      },
      {
        name: 'Respuesta contiene el número real (no solo "voy a consultar")',
        fn: (r) => /\d+/.test(r.text) && !r.text.toLowerCase().includes('un momento'),
        critical: true,
      },
    ],
  },
  {
    id: 'T06',
    name: 'Proyección multi-paso: ingresos futuros',
    messages: [{ role: 'user', content: 'Proyecta los ingresos totales para los próximos 4 trimestres' }],
    checks: [
      {
        name: 'Consulta la BD primero',
        fn: (r) => r.usedTools.includes('query_database'),
        critical: true,
      },
      {
        name: 'Llama project_data',
        fn: (r) => r.usedTools.includes('project_data'),
        critical: true,
      },
      {
        name: 'Genera visualización de proyección',
        fn: (r) => r.hasProjection,
        critical: false,
      },
      {
        name: 'La query de BD no falló',
        fn: (r) => r.debug.every((d) => !d.error),
        critical: true,
      },
    ],
  },
  {
    id: 'T07',
    name: 'Retención de contexto: pregunta de seguimiento',
    messages: [
      { role: 'user', content: '¿Cuántos clientes activos hay?' },
      { role: 'assistant', content: 'Hay 45 clientes activos en la base de datos.' },
      { role: 'user', content: '¿Y cuántos inactivos?' },
    ],
    checks: [
      {
        name: 'Consulta la BD para la segunda pregunta',
        fn: (r) => r.usedTools.includes('query_database'),
        critical: true,
      },
      {
        name: 'SQL filtra por status inactivo',
        fn: (r) => r.debug.some((d) =>
          d.sql?.toLowerCase().includes('inactivo') ||
          d.sql?.toLowerCase().includes('inactive') ||
          (d.sql?.toLowerCase().includes('client') && d.sql?.toLowerCase().includes('status'))
        ),
        critical: true,
      },
    ],
  },
  {
    id: 'T08',
    name: 'Pregunta ambigua: no debe alucinar',
    messages: [{ role: 'user', content: '¿Cómo van los números este año?' }],
    checks: [
      {
        name: 'Consulta la BD en lugar de inventar',
        fn: (r) => r.usedTools.includes('query_database'),
        critical: true,
      },
    ],
  },
  {
    id: 'T09',
    name: 'Multi-tabla: comparar ingresos y gastos',
    messages: [{ role: 'user', content: 'Compara los ingresos y gastos del año 2024 por trimestre' }],
    checks: [
      {
        name: 'Consulta la BD',
        fn: (r) => r.usedTools.includes('query_database'),
        critical: true,
      },
      {
        name: 'Hace al menos 2 queries (Revenue y Expense) O una sola con JOIN',
        fn: (r) =>
          r.debug.length >= 2 ||
          r.debug.some((d) => d.sql?.toLowerCase().includes('join') ||
            (d.sql?.toLowerCase().includes('revenue') && d.sql?.toLowerCase().includes('expense'))),
        critical: false,
      },
      {
        name: 'Las queries no fallaron',
        fn: (r) => r.debug.every((d) => !d.error),
        critical: true,
      },
    ],
  },
  {
    id: 'T10',
    name: 'Gráfica automática: serie de tiempo',
    messages: [{ role: 'user', content: 'Muéstrame la evolución de ingresos por trimestre en una gráfica' }],
    checks: [
      {
        name: 'Consulta la BD',
        fn: (r) => r.usedTools.includes('query_database'),
        critical: true,
      },
      {
        name: 'Genera una gráfica',
        fn: (r) => r.hasChart || r.usedTools.includes('render_chart'),
        critical: true,
      },
    ],
  },
]

// ─── Runner ───────────────────────────────────────────────────────────────────

const RESET = '\x1b[0m'
const GREEN = '\x1b[32m'
const RED = '\x1b[31m'
const YELLOW = '\x1b[33m'
const BOLD = '\x1b[1m'
const DIM = '\x1b[2m'
const CYAN = '\x1b[36m'

async function runTests() {
  console.log(`\n${BOLD}Dashi Breakpoint Tests${RESET}`)
  console.log(`${DIM}Servidor: ${BASE_URL}${RESET}\n`)

  let passed = 0
  let failed = 0
  let criticalFailed = 0
  const failures: { test: string; check: string; sql?: string }[] = []

  for (const test of TESTS) {
    await new Promise((r) => setTimeout(r, DELAY_BETWEEN_TESTS_MS))
    process.stdout.write(`${CYAN}[${test.id}]${RESET} ${test.name} ... `)

    let result: StreamResult
    try {
      result = await sendChat(test.messages)
    } catch (e) {
      console.log(`${RED}ERROR DE RED${RESET}`)
      console.log(`  ${DIM}${e}${RESET}`)
      failed++
      continue
    }

    if (result.error) {
      console.log(`${RED}FALLO HTTP: ${result.error}${RESET}`)
      failed++
      continue
    }

    const checkResults = test.checks.map((check) => ({
      check,
      ok: check.fn(result),
    }))

    const allPassed = checkResults.every((c) => c.ok)
    const criticalPassed = checkResults.filter((c) => c.check.critical).every((c) => c.ok)

    if (allPassed) {
      console.log(`${GREEN}PASÓ${RESET}`)
      passed++
    } else {
      console.log(`${RED}FALLÓ${RESET}`)
      failed++
      if (!criticalPassed) criticalFailed++

      for (const { check, ok } of checkResults) {
        if (!ok) {
          const tag = check.critical ? `${RED}✗ CRÍTICO${RESET}` : `${YELLOW}✗ warn${RESET}`
          console.log(`  ${tag} ${check.name}`)
          failures.push({ test: `${test.id} ${test.name}`, check: check.name })
        }
      }
    }

    // Show debug SQL if available
    if (result.debug.length > 0) {
      for (const entry of result.debug) {
        const status = entry.error ? `${RED}ERROR: ${entry.error}${RESET}` : `${GREEN}${entry.rowCount ?? '?'} filas${RESET}`
        console.log(`  ${DIM}  SQL: ${entry.sql?.slice(0, 100)}...${RESET}`)
        console.log(`  ${DIM}  → ${status}${RESET}`)
      }
    } else if (!allPassed) {
      console.log(`  ${YELLOW}  ⚠ No se llamó query_database${RESET}`)
      console.log(`  ${DIM}  Respuesta: ${result.text.slice(0, 150)}${RESET}`)
    }

    console.log()
  }

  // Summary
  console.log(`${BOLD}─────────────────────────────────────${RESET}`)
  console.log(`Resultados: ${GREEN}${passed} pasaron${RESET} / ${RED}${failed} fallaron${RESET} (${TESTS.length} total)`)
  if (criticalFailed > 0) {
    console.log(`${RED}${BOLD}⚠ ${criticalFailed} test(s) con fallas críticas${RESET}`)
  }
  if (failures.length > 0) {
    console.log(`\n${BOLD}Fallas:${RESET}`)
    for (const f of failures) {
      console.log(`  ${RED}•${RESET} [${f.test}] → ${f.check}`)
    }
  }
  console.log()
}

runTests().catch(console.error)
