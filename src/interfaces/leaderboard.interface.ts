export interface LeaderboardTrade {
  symbol: string
  side: 'SELL'
  qty: number
  price: number
  realizedPnl: number
  executedAt: string
}

export interface LeaderboardPosition {
  symbol: string
  qty: number
  avgEntryPrice: number
  createdAt: string
  updatedAt: string
}

export interface LeaderboardEntry {
  username: string
  totalPnl: number
  bestTrade: number
  worstTrade: number
  bestTradeDetails?: LeaderboardTrade
  worstTradeDetails?: LeaderboardTrade
  mostSuccessfulTransactions: LeaderboardTrade[]
  openPositions: LeaderboardPosition[]
}

export interface LeaderboardResponse {
  hallOfFame: LeaderboardEntry[]
  wallOfShame: LeaderboardEntry[]
}
