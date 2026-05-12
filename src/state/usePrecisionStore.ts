import { create } from 'zustand'

export type DisplayPrecision = 2 | 4 | 8

const PRECISION_STEPS: DisplayPrecision[] = [2, 4, 8]

interface PrecisionState {
  precision: DisplayPrecision
  togglePrecision: () => void
  setPrecision: (precision: DisplayPrecision) => void
}

function readInitialPrecision(): DisplayPrecision {
  try {
    const stored = Number(localStorage.getItem('displayPrecision'))

    return PRECISION_STEPS.includes(stored as DisplayPrecision)
      ? stored as DisplayPrecision
      : 8
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
      const currentIndex = PRECISION_STEPS.indexOf(state.precision)
      const precision = PRECISION_STEPS[(currentIndex + 1) % PRECISION_STEPS.length]
      persistPrecision(precision)

      return { precision }
    }),
  setPrecision: (precision) =>
    set(() => {
      persistPrecision(precision)

      return { precision }
    })
}))
