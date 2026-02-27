export type TradePayload =
  | { symbol: string; side: 'BUY' | 'SELL'; qty: number }
  | { symbol: string; side: 'BUY' | 'SELL'; amountUSD: number }
  | { symbol: string; side: 'BUY'; useAllCash: true }
  | { symbol: string; side: 'SELL'; sellAll: true }