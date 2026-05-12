import { create } from 'zustand'

export type DisplayPrecision = 4 | 8

interface PrecisionState {
  precision: DisplayPrecision
  togglePrecision: () => void
  setPrecision: (precision: DisplayPrecision) => void
}

function readInitialPrecision(): DisplayPrecision {
  try {
    return localStorage.getItem('displayPrecision') === '4' ? 4 : 8
  } catch {
    return 8
  }
}

function persistPrecision(precision: DisplayPrecision) {
  try {
    localStorage.setItem('displayPrecision', String(precision))
  } catch {
    // ignore storage errors
  }
}

export const usePrecisionStore = create<PrecisionState>((set) => ({
  precision: readInitialPrecision(),
  togglePrecision: () =>
    set((state) => {
      const precision = state.precision === 8 ? 4 : 8
      persistPrecision(precision)

      return { precision }
    }),
  setPrecision: (precision) =>
    set(() => {
      persistPrecision(precision)

      return { precision }
    })
}))
