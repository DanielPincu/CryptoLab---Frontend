import { http } from './http.api'
import type { TradePayload } from '../interfaces/tradePayload.interface'

export async function executeTrade(payload: TradePayload) {
  const { data } = await http.post('/trade', payload)
  return data
}