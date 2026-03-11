export interface RegressionResult {
  slope: number
  intercept: number
  r2: number
}

/** Ordinary least-squares linear regression over an ordered value series. */
export function linearRegression(values: number[]): RegressionResult {
  const n = values.length
  if (n < 2) return { slope: 0, intercept: values[0] ?? 0, r2: 0 }

  const meanX = (n - 1) / 2
  const meanY = values.reduce((a, b) => a + b, 0) / n

  let ssXY = 0, ssXX = 0, ssYY = 0
  for (let i = 0; i < n; i++) {
    ssXY += (i - meanX) * (values[i] - meanY)
    ssXX += (i - meanX) ** 2
    ssYY += (values[i] - meanY) ** 2
  }

  const slope = ssXX === 0 ? 0 : ssXY / ssXX
  const intercept = meanY - slope * meanX
  const r2 = ssYY === 0 ? 1 : (ssXY ** 2) / (ssXX * ssYY)

  return { slope, intercept, r2 }
}

/** Project `periods` future values using linear regression. */
export function projectLinear(values: number[], periods: number): number[] {
  const { slope, intercept } = linearRegression(values)
  const n = values.length
  return Array.from({ length: periods }, (_, i) =>
    Math.max(0, intercept + slope * (n + i))
  )
}

/** Project `periods` future values using compound average growth rate. */
export function projectGrowthRate(
  values: number[],
  periods: number
): { values: number[]; avgGrowthRate: number } {
  if (values.length < 2) {
    return { values: Array(periods).fill(values[0] ?? 0), avgGrowthRate: 0 }
  }

  const rates: number[] = []
  for (let i = 1; i < values.length; i++) {
    if (values[i - 1] !== 0) {
      rates.push((values[i] - values[i - 1]) / values[i - 1])
    }
  }

  const avgRate = rates.length > 0 ? rates.reduce((a, b) => a + b, 0) / rates.length : 0
  let current = values[values.length - 1]

  const projected: number[] = []
  for (let i = 0; i < periods; i++) {
    current = current * (1 + avgRate)
    projected.push(Math.max(0, current))
  }

  return { values: projected, avgGrowthRate: avgRate }
}
