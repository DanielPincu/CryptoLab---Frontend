import { post } from './http.api'
import type { TradePayload } from '../interfaces/tradePayload.interface'

export async function executeTrade(payload: TradePayload) {
  return await post('/trade', payload)
}