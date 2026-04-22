import { create } from 'zustand'
import type { IPosition } from '../interfaces/position.interface'

interface PositionState {
  positions: IPosition[]
  setPositions: (positions: IPosition[]) => void
  updatePosition: (symbol: string, qty: number) => void
  clearPositions: () => void
}

export const usePositionStore = create<PositionState>((set) => ({
  positions: [],
  setPositions: (positions) => set({ positions: [...positions] }),
  updatePosition: (symbol, qty) =>
    set((state) => ({
      positions: state.positions.map((position) =>
        position.symbol === symbol ? { ...position, qty } : position
      )
    })),
  clearPositions: () => set({ positions: [] })
}))
