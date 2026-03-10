export interface ITransaction {
  _id: string
  userId: string
  symbol: string
  side: 'BUY' | 'SELL'
  qty: number
  price: number
  realizedPnl?: number
  executedAt: string
  createdAt: string
  updatedAt: string
}