import { get } from './http.api'
import type { PortfolioSummary } from '../interfaces/portfolioSummary.interface'

export async function getPortfolioSummary(): Promise<PortfolioSummary> {
  return await get('/portfolio/summary')
}