import { http } from './http.api'
import type { IMarketTick } from '../interfaces/marketTick.interface'

export async function apiMarketLatest(): Promise<IMarketTick[]> {
  const res = await http.get('/market/latest')
  return res.data
}

export async function apiMarketLatestBySymbol(symbol: string): Promise<IMarketTick> {
  const res = await http.get(`/market/latest/${symbol}`)
  return res.data
}