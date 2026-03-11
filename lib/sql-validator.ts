const FORBIDDEN_KEYWORDS = [
  'INSERT', 'UPDATE', 'DELETE', 'DROP', 'ALTER', 'CREATE',
  'TRUNCATE', 'EXEC', 'EXECUTE', 'GRANT', 'REVOKE',
  'MERGE', 'CALL', 'INTO',
]

export function validateSQL(sql: string): { valid: boolean; error?: string } {
  const upper = sql.toUpperCase().trim()

  if (!upper.startsWith('SELECT') && !upper.startsWith('WITH')) {
    return { valid: false, error: 'Solo se permiten consultas SELECT.' }
  }

  for (const keyword of FORBIDDEN_KEYWORDS) {
    const regex = new RegExp(`\\b${keyword}\\b`, 'i')
    if (regex.test(sql)) {
      return { valid: false, error: `Palabra prohibida detectada: ${keyword}` }
    }
  }

  if (sql.includes(';')) {
    return { valid: false, error: 'No se permiten múltiples sentencias.' }
  }

  return { valid: true }
}
