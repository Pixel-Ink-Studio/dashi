import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Dashi-DeLorean | Grupo Financiero ACME',
  description: 'Asistente financiera inteligente de Grupo Financiero ACME',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  )
}
