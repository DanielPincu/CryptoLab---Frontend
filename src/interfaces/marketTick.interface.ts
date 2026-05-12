export interface IMarketTick {
  symbol: string
  price: number | null
  ts: number | null
  source: 'finnhub' | 'binance' | null
}
