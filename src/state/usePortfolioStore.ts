import { create } from 'zustand'
import type { IPortfolioSummary } from '../interfaces/portfolioSummary.interface'

interface PortfolioState {
  summary: IPortfolioSummary | null
  setSummary: (summary: IPortfolioSummary | null) => void
  clearSummary: () => void
}

export const usePortfolioStore = create<PortfolioState>((set) => ({
  summary: null,
  setSummary: (summary) => set({ summary }),
  clearSummary: () => set({ summary: null })
}))
