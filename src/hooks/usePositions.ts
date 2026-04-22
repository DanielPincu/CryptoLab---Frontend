import { useEffect, useMemo } from 'react'
import { getPositions } from '../api/positions.api'
import { usePositionStore } from '../state/usePositionStore'
import { usePriceStore } from '../state/usePriceStore'
import type { IPosition } from '../interfaces/position.interface'

interface UsePositionsParams {
  positions?: IPosition[]
  refreshKey?: number
}

export function usePositions({ positions, refreshKey }: UsePositionsParams) {
  const storedPositions = usePositionStore((state) => state.positions)
  const setPositions = usePositionStore((state) => state.setPositions)
  const prices = usePriceStore((state) => state.prices)
  const isControlled = positions !== undefined

  useEffect(() => {
    if (!isControlled) {
      getPositions()
        .then((data) => setPositions(data ?? []))
        .catch(() => setPositions([]))
    }
  }, [isControlled, refreshKey, setPositions])

  const sourcePositions = useMemo(() => {
    return isControlled ? positions ?? [] : storedPositions
  }, [isControlled, positions, storedPositions])

  const livePositions = useMemo(() => {
    return sourcePositions.map((p) => {
      const livePrice = prices[p.symbol]?.price ?? p.currentPrice ?? null

      if (livePrice == null) {
        return { ...p, currentPrice: null }
      }

      const marketValue = livePrice * p.qty
      const positionCost = p.positionCost
      const unrealizedPnl = marketValue - positionCost
      const unrealizedPnlPercent =
        positionCost > 0 ? (unrealizedPnl / positionCost) * 100 : null

      return {
        ...p,
        currentPrice: livePrice,
        marketValue,
        unrealizedPnl,
        unrealizedPnlPercent
      }
    })
  }, [prices, sourcePositions])

  return {
    positions: livePositions
  }
}
