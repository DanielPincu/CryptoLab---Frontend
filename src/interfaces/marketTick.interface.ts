export interface IMarketTick {
  symbol: string
  price: number | null
  source?: 'finnhub' | 'binance'
}