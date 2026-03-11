export const UI_TEXT = {
  // Input
  placeholder: 'Escribe tu pregunta...',
  send: 'Enviar',
  voicePrompt: 'Presiona para hablar',

  // States
  recording: 'Escuchando...',
  transcribing: 'Transcribiendo...',
  thinking: 'Procesando...',
  speaking: 'Dashi está hablando...',

  // Mode toggle
  textMode: 'Texto',
  voiceMode: 'Voz',

  // Errors
  micPermissionDenied: 'No se pudo acceder al micrófono. Permite el acceso en tu navegador.',
  transcriptionFailed: 'No pude entender lo que dijiste. ¿Podrías repetirlo?',
  ttsFailed: 'Error al generar audio. Mostrando respuesta en texto.',
  networkError: 'Error de conexión. Verifica tu internet.',
  emptyResults: 'No se encontraron datos para esta consulta.',

  // Data
  exportCSV: 'Exportar CSV',

  // Footer
  poweredBy: 'Dashi-DeLorean • Grupo Financiero ACME',
  disclaimer: 'Las proyecciones son estimaciones basadas en datos históricos y no constituyen asesoría financiera.',

  // Navbar
  brandName: 'Grupo Financiero ACME',
  appName: 'Dashi-DeLorean',

  // Chat
  welcome: '¡Hola! Soy Dashi, tu asistente financiera de Grupo Financiero ACME. ¿En qué puedo ayudarte hoy?',
  you: 'Tú',
  dashi: 'Dashi',
} as const

export const MODELS = {
  chat: 'gpt-4o',
} as const
