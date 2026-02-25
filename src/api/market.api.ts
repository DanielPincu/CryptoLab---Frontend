import { http } from './http.api'
import type { IMarketTick } from '../interfaces/marketTick.interface'


 // Latest prices for user's favorites

export async function apiMarketLatest(): Promise<IMarketTick[]> {
  const res = await http.get('/market/latest')
  return res.data
}

export async function apiMarketLatestBySymbol(symbol: string): Promise<IMarketTick> {
  const res = await http.get(`/market/latest/${symbol}`)
  return res.data
}


 // All Binance USDT symbols (public endpoint)

export async function apiMarketSymbols(): Promise<
  Array<{
    description: string
    displaySymbol: string
    symbol: string
  }>
> {
  const COMMON = ["BTCUSDT","ETHUSDT","BNBUSDT","SOLUSDT","XRPUSDT","ADAUSDT","DOGEUSDT","TONUSDT","AVAXUSDT","TRXUSDT","DOTUSDT","LINKUSDT","MATICUSDT","SHIBUSDT","LTCUSDT","BCHUSDT","ICPUSDT","APTUSDT","NEARUSDT","ATOMUSDT","FILUSDT","XLMUSDT","ETCUSDT","HBARUSDT","ARBUSDT","OPUSDT","INJUSDT","UNIUSDT","AAVEUSDT","FTMUSDT","RNDRUSDT","IMXUSDT","GRTUSDT","EGLDUSDT","SANDUSDT","MANAUSDT","FLOWUSDT","XTZUSDT","KASUSDT","PEPEUSDT","THETAUSDT","RUNEUSDT","MKRUSDT","CRVUSDT","SNXUSDT","LDOUSDT","QNTUSDT","ALGOUSDT","EOSUSDT"]

  return COMMON.map((symbol) => ({
    symbol,
    displaySymbol: symbol,
    description: symbol
  }))
}


 // Live quote from REST snapshot

export async function apiMarketQuote(symbol: string): Promise<{
  symbol: string
  price: number
  ts: number
  source: string
}> {
  const res = await http.get('/market/quote', {
    params: { symbol }
  })
  return res.data
}


 // Binance historical candles

export async function apiMarketHistory(
  symbol: string,
  interval = '5m',
  limit = 120
): Promise<{
  symbol: string
  interval: string
  candles: Array<{
    time: number
    open: number
    high: number
    low: number
    close: number
    volume: number
  }>
}> {
  const res = await http.get('/market/history', {
    params: { symbol, interval, limit }
  })
  return res.data
}