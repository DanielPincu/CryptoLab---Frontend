export type MarketTickerDirection = 'up' | 'down' | 'flat'

export interface IMarketTickerMove {
  direction: MarketTickerDirection
  percent: number
}

export interface IMarketTickerRow {
  symbol: string
  displaySymbol: string
  price: number
  priceLabel: string
  percentLabel: string
  move: IMarketTickerMove
}

export interface IMarketTickerProps {
  className?: string
  maxItems?: number
  symbols?: string[]
}

export interface IUseMarketTickerResult {
  rows: IMarketTickerRow[]
  status: 'connecting' | 'open' | 'closed' | 'error'
  duration: number
}
