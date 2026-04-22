export interface IPosition {
  _id: string
  symbol: string
  qty: number
  avgEntryPrice: number

  currentPrice: number | null
  positionCost: number
  marketValue: number | null
  unrealizedPnl: number | null
  unrealizedPnlPercent: number | null

  createdAt: string
  updatedAt: string
}

export type Position = IPosition
