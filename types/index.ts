export type Role = 'user' | 'assistant'
export type ChatMode = 'text' | 'voice'
export type VoiceState = 'idle' | 'recording' | 'transcribing' | 'thinking' | 'speaking'

export interface ChartDataPoint {
  label: string
  [key: string]: string | number
}

export interface ChartData {
  type: 'bar' | 'line' | 'area' | 'pie'
  title: string
  data: ChartDataPoint[]
  xLabel?: string
  yLabel?: string
}

export interface ProjectionDataPoint {
  label: string
  actual?: number
  proyectado?: number
}

export interface ProjectionData {
  title: string
  method: 'linear' | 'growth_rate'
  data: ProjectionDataPoint[]
  /** Average period-over-period growth rate (growth_rate method only) */
  growthRate?: number
  /** R² goodness of fit (linear method only) */
  r2?: number
}

export interface Message {
  id: string
  role: Role
  content: string
  timestamp: Date
  chartData?: ChartData
  tableData?: Record<string, unknown>[]
  projectionData?: ProjectionData
}
