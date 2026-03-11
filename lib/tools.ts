import type OpenAI from 'openai'

export const PROJECTION_TOOL: OpenAI.Chat.ChatCompletionTool = {
  type: 'function',
  function: {
    name: 'project_data',
    description:
      'Calcula proyecciones financieras basadas en datos históricos consultados de la base de datos. ' +
      'Úsala cuando el usuario pida estimaciones, tendencias futuras o proyecciones de cualquier métrica. ' +
      'Primero usa query_database para obtener los datos históricos, luego llama esta herramienta con esos valores.',
    parameters: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Título descriptivo de la proyección en español. Ej: "Proyección de Ingresos 2025"',
        },
        historical_data: {
          type: 'string',
          description:
            'Array JSON de puntos históricos en orden cronológico. Cada elemento debe tener "label" (string) y "value" (número). ' +
            'Ejemplo: [{"label":"2023-Q1","value":45000000},{"label":"2023-Q2","value":48000000}]',
        },
        future_labels: {
          type: 'string',
          description:
            'Array JSON de etiquetas para los períodos futuros a proyectar. ' +
            'Ejemplo: ["2025-Q1","2025-Q2","2025-Q3","2025-Q4"]',
        },
        method: {
          type: 'string',
          enum: ['linear', 'growth_rate'],
          description:
            '"linear" usa regresión lineal — ideal para tendencias estables o lineales. ' +
            '"growth_rate" usa tasa de crecimiento promedio — ideal para datos con crecimiento porcentual compuesto.',
        },
        periods: {
          type: 'number',
          description: 'Número de períodos futuros a proyectar. Debe coincidir con la longitud de future_labels.',
        },
      },
      required: ['title', 'historical_data', 'future_labels', 'method', 'periods'],
    },
  },
}

export const CHART_TOOL: OpenAI.Chat.ChatCompletionTool = {
  type: 'function',
  function: {
    name: 'render_chart',
    description:
      'Genera una gráfica para visualizar datos numéricos. Úsala cuando los resultados de una consulta se beneficien de representación visual: series de tiempo, comparaciones entre categorías, distribuciones.',
    parameters: {
      type: 'object',
      properties: {
        chart_type: {
          type: 'string',
          enum: ['bar', 'line', 'area', 'pie'],
          description: 'Tipo de gráfica.',
        },
        title: { type: 'string', description: 'Título de la gráfica en español.' },
        data: {
          type: 'string',
          description:
            'Array JSON de objetos con campo "label" (string) y campos numéricos para cada serie. Ejemplo: [{"label":"Q1","ingresos":45000000},{"label":"Q2","ingresos":48500000}]',
        },
        x_label: { type: 'string', description: 'Etiqueta del eje X.' },
        y_label: { type: 'string', description: 'Etiqueta del eje Y.' },
      },
      required: ['chart_type', 'title', 'data'],
    },
  },
}

export const DB_QUERY_TOOL: OpenAI.Chat.ChatCompletionTool = {
  type: 'function',
  function: {
    name: 'query_database',
    description:
      'Ejecuta una consulta SQL de solo lectura contra la base de datos de Grupo Financiero ACME. ' +
      'Solo SELECT está permitido. Usa esta herramienta cuando el usuario pregunte sobre datos financieros, ' +
      'métricas, ingresos, gastos, clientes o cualquier información almacenada en la base de datos. ' +
      'Las tablas disponibles son: Revenue (ingresos), Expense (gastos), Client (clientes), FinancialIndicator (indicadores).',
    parameters: {
      type: 'object',
      properties: {
        sql: {
          type: 'string',
          description:
            'La consulta SQL SELECT a ejecutar. NUNCA incluyas INSERT, UPDATE, DELETE, DROP, ALTER, CREATE o TRUNCATE.',
        },
        explanation: {
          type: 'string',
          description: 'Breve explicación en español de qué datos busca esta consulta.',
        },
      },
      required: ['sql', 'explanation'],
    },
  },
}
