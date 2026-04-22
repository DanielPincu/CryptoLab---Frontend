import type { Position } from './position.interface'

export interface PositionsProps {
  positions?: Position[]
  selectedSymbol?: string | null
  onSelect?: (symbol: string) => void
  refreshKey?: number
  onCountChange?: (count: number) => void
}
