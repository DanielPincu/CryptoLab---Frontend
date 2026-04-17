import { get } from './http.api'
import type { Position } from '../interfaces/position.interface'

export async function getPositions(): Promise<Position[]> {
  const data = await get('/positions')
  return data ?? []
}

export async function getPosition(symbol: string): Promise<Position | null> {
  const positions = (await get('/positions')) ?? []
  const pos = positions.find((p: Position) => p.symbol === symbol)

  return pos ?? null
}