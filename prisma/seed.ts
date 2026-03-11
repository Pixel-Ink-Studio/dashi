import 'dotenv/config'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../lib/generated/prisma/client'

const pool = new Pool({ connectionString: process.env.DATABASE_URL!, ssl: { rejectUnauthorized: false } })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Inserting seed data...')

  // Revenue — 8 quarters of data across two categories
  const revenueData = [
    { period: '2023-Q1', year: 2023, quarter: 1, amount: 45_000_000, category: 'servicios' },
    { period: '2023-Q1', year: 2023, quarter: 1, amount: 12_000_000, category: 'inversiones' },
    { period: '2023-Q2', year: 2023, quarter: 2, amount: 48_500_000, category: 'servicios' },
    { period: '2023-Q2', year: 2023, quarter: 2, amount: 13_200_000, category: 'inversiones' },
    { period: '2023-Q3', year: 2023, quarter: 3, amount: 52_000_000, category: 'servicios' },
    { period: '2023-Q3', year: 2023, quarter: 3, amount: 14_500_000, category: 'inversiones' },
    { period: '2023-Q4', year: 2023, quarter: 4, amount: 55_200_000, category: 'servicios' },
    { period: '2023-Q4', year: 2023, quarter: 4, amount: 15_800_000, category: 'inversiones' },
    { period: '2024-Q1', year: 2024, quarter: 1, amount: 51_000_000, category: 'servicios' },
    { period: '2024-Q1', year: 2024, quarter: 1, amount: 14_100_000, category: 'inversiones' },
    { period: '2024-Q2', year: 2024, quarter: 2, amount: 54_800_000, category: 'servicios' },
    { period: '2024-Q2', year: 2024, quarter: 2, amount: 16_200_000, category: 'inversiones' },
    { period: '2024-Q3', year: 2024, quarter: 3, amount: 58_300_000, category: 'servicios' },
    { period: '2024-Q3', year: 2024, quarter: 3, amount: 17_900_000, category: 'inversiones' },
    { period: '2024-Q4', year: 2024, quarter: 4, amount: 62_100_000, category: 'servicios' },
    { period: '2024-Q4', year: 2024, quarter: 4, amount: 19_400_000, category: 'inversiones' },
  ]

  // Expenses — 8 quarters across categories
  const expenseData = [
    { period: '2023-Q1', year: 2023, quarter: 1, amount: 22_000_000, category: 'nomina' },
    { period: '2023-Q1', year: 2023, quarter: 1, amount: 8_500_000,  category: 'operacion' },
    { period: '2023-Q2', year: 2023, quarter: 2, amount: 22_500_000, category: 'nomina' },
    { period: '2023-Q2', year: 2023, quarter: 2, amount: 9_000_000,  category: 'operacion' },
    { period: '2023-Q3', year: 2023, quarter: 3, amount: 23_000_000, category: 'nomina' },
    { period: '2023-Q3', year: 2023, quarter: 3, amount: 9_800_000,  category: 'operacion' },
    { period: '2023-Q4', year: 2023, quarter: 4, amount: 23_500_000, category: 'nomina' },
    { period: '2023-Q4', year: 2023, quarter: 4, amount: 10_200_000, category: 'operacion' },
    { period: '2024-Q1', year: 2024, quarter: 1, amount: 24_000_000, category: 'nomina' },
    { period: '2024-Q1', year: 2024, quarter: 1, amount: 9_500_000,  category: 'operacion' },
    { period: '2024-Q2', year: 2024, quarter: 2, amount: 24_500_000, category: 'nomina' },
    { period: '2024-Q2', year: 2024, quarter: 2, amount: 10_500_000, category: 'operacion' },
    { period: '2024-Q3', year: 2024, quarter: 3, amount: 25_000_000, category: 'nomina' },
    { period: '2024-Q3', year: 2024, quarter: 3, amount: 11_000_000, category: 'operacion' },
    { period: '2024-Q4', year: 2024, quarter: 4, amount: 25_500_000, category: 'nomina' },
    { period: '2024-Q4', year: 2024, quarter: 4, amount: 11_800_000, category: 'operacion' },
  ]

  // Financial indicators
  const indicatorData = [
    { name: 'ROE',                  value: 0.1420, period: '2024-Q4', year: 2024, quarter: 4 },
    { name: 'ROA',                  value: 0.0215, period: '2024-Q4', year: 2024, quarter: 4 },
    { name: 'Indice de Morosidad',  value: 0.0320, period: '2024-Q4', year: 2024, quarter: 4 },
    { name: 'Cartera Vencida',      value: 0.0280, period: '2024-Q4', year: 2024, quarter: 4 },
    { name: 'ROE',                  value: 0.1380, period: '2024-Q3', year: 2024, quarter: 3 },
    { name: 'ROA',                  value: 0.0208, period: '2024-Q3', year: 2024, quarter: 3 },
    { name: 'Indice de Morosidad',  value: 0.0335, period: '2024-Q3', year: 2024, quarter: 3 },
    { name: 'ROE',                  value: 0.1290, period: '2023-Q4', year: 2023, quarter: 4 },
    { name: 'ROA',                  value: 0.0195, period: '2023-Q4', year: 2023, quarter: 4 },
  ]

  // Clients sample
  const clientData = [
    { name: 'Constructora Norteña S.A.',    segment: 'empresarial', portfolioValue: 8_500_000,  status: 'activo',   joinDate: new Date('2020-03-15') },
    { name: 'Distribuidora del Pacífico',   segment: 'pyme',        portfolioValue: 2_300_000,  status: 'activo',   joinDate: new Date('2021-07-01') },
    { name: 'Laura Méndez Garza',           segment: 'personal',    portfolioValue: 450_000,    status: 'activo',   joinDate: new Date('2022-01-20') },
    { name: 'Grupo Industrial Bajío S.A.',  segment: 'empresarial', portfolioValue: 22_000_000, status: 'activo',   joinDate: new Date('2019-11-10') },
    { name: 'Farmacia Guadalajara Norte',   segment: 'pyme',        portfolioValue: 1_800_000,  status: 'activo',   joinDate: new Date('2021-04-05') },
    { name: 'Roberto Solís Herrera',        segment: 'personal',    portfolioValue: 320_000,    status: 'inactivo', joinDate: new Date('2020-08-22') },
    { name: 'Tech Monterrey S. de R.L.',    segment: 'pyme',        portfolioValue: 3_750_000,  status: 'activo',   joinDate: new Date('2023-02-14') },
    { name: 'Inversiones del Norte S.A.',   segment: 'empresarial', portfolioValue: 15_200_000, status: 'activo',   joinDate: new Date('2018-06-30') },
  ]

  await prisma.revenue.createMany({ data: revenueData })
  await prisma.expense.createMany({ data: expenseData })
  await prisma.financialIndicator.createMany({ data: indicatorData })
  await prisma.client.createMany({ data: clientData })

  console.log('✓ Seed data inserted successfully.')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
