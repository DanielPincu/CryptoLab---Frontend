export interface PortfolioSummary {
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
}