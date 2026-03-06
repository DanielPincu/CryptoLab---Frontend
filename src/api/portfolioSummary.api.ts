import { http } from './http.api'
import type { PortfolioSummary } from '../interfaces/portfolioSummary.interface'

export async function getPortfolioSummary(): Promise<PortfolioSummary> {
  const { data } = await http.get('/portfolio/summary')
  return data
}