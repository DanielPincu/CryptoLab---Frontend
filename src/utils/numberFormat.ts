import type { DisplayPrecision } from '../state/usePrecisionStore'

export function fixed8(value: number, precision: DisplayPrecision = 8) {
  return value.toFixed(precision)
}

export function money8(value: number, precision: DisplayPrecision = 8) {
  return `$${fixed8(value, precision)}`
}

export function percent8(value: number, precision: DisplayPrecision = 8) {
  return `${fixed8(value, precision)}%`
}
