import { http } from './http.api'
import type { Position } from '../interfaces/position.interface'

export async function getPositions(): Promise<Position[]> {
  const { data } = await http.get<Position[]>('/positions')
  return data ?? []
}

export async function getPosition(symbol: string): Promise<Position | null> {
  const { data } = await http.get<Position[]>('/positions')

  const positions = data ?? []
  const pos = positions.find(p => p.symbol === symbol)

  return pos ?? null
}