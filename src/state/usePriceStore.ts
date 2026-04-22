import { create } from 'zustand'
import type { IMarketTick } from '../interfaces/marketTick.interface'

interface PriceState {
  prices: Record<string, IMarketTick>
  setPrice: (symbol: string, tick: IMarketTick) => void
  setBulkPrices: (map: Record<string, IMarketTick>) => void
}

export const usePriceStore = create<PriceState>((set) => ({
  prices: {},
  setPrice: (symbol, tick) =>
    set((state) => ({
      prices: {
        ...state.prices,
        [symbol]: { ...tick }
      }
    })),
  setBulkPrices: (map) =>
    set({
      prices: Object.fromEntries(
        Object.entries(map).map(([symbol, tick]) => [symbol, { ...tick }])
      )
    })
}))
