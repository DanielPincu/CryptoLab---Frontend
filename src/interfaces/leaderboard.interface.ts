export interface LeaderboardEntry {
  username: string
  totalPnl: number
  bestTrade: number
  worstTrade: number
}

export interface LeaderboardResponse {
  hallOfFame: LeaderboardEntry[]
  wallOfShame: LeaderboardEntry[]
}