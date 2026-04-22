export interface IPortfolioSummary {
  cashBalance: number
  positionsValue: number
  totalValue: number
  unrealizedPnl: number
  realizedPnl: number
  netPnl: number
  totalReturnPct: number
  totalInvested: number
  totalSold: number
  updatedAt: string
  luckyStrike?: {
    progressPercent: number
    remainingPercent: number
    targetPercent: number
    reward: number
    achieved: boolean
    startEquity: number
  }
}

export type PortfolioSummary = IPortfolioSummary
