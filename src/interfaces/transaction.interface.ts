export interface ITransaction {
  _id: string
  userId: string
  symbol: string
  side: 'BUY' | 'SELL' | 'REWARD'
  qty: number
  price: number
  amountUSD?: number
  costBasis?: number
  realizedPnl?: number
  realizedPnlPercent?: number
  executedAt: string
  createdAt: string
  updatedAt: string
}

export type TransactionSide = ITransaction['side']
export type TransactionGroupBy = 'month' | 'year'

export interface TransactionReportTotals {
  transactionCount: number
  buyCount: number
  sellCount: number
  rewardCount: number
  buyVolume: number
  sellVolume: number
  rewardAmount: number
  realizedPnl: number
  winningTrades: number
  losingTrades: number
  flatTrades: number
  winRate: number | null
  netCashFlow: number
}

export interface TransactionPeriodSummary extends TransactionReportTotals {
  period: string
  from: string
  to: string
}

export interface TransactionSymbolSummary extends TransactionReportTotals {
  symbol: string
}

export interface TransactionAuditReport {
  generatedAt: string
  scope: {
    userId: string
    symbol: string | null
    side: TransactionSide | null
    from: string | null
    to: string | null
    groupBy: TransactionGroupBy
  }
  totals: TransactionReportTotals
  periods: TransactionPeriodSummary[]
  symbols: TransactionSymbolSummary[]
  items: ITransaction[]
}
