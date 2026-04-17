import { useEffect, useMemo, useState } from 'react'
import { useWsPrices } from '../state/useWsPrices'
import { getPositions } from '../api/positions.api'
import type { Position } from '../interfaces/position.interface'

interface UsePositionsParams {
  positions?: Position[]
  refreshKey?: number
}

export function usePositions({ positions, refreshKey }: UsePositionsParams) {
  const ws = useWsPrices()

  const [internalPositions, setInternalPositions] = useState<Position[]>([])
  const isControlled = positions !== undefined

  useEffect(() => {
    if (!isControlled) {
      getPositions()
        .then((data) => setInternalPositions(data ?? []))
        .catch(() => setInternalPositions([]))
    }
  }, [isControlled, refreshKey])

  const sourcePositions = useMemo(() => {
    return isControlled ? positions ?? [] : internalPositions
  }, [isControlled, positions, internalPositions])

  const livePositions = useMemo(() => {
    return sourcePositions.map((p) => {
      const livePrice = ws.prices?.[p.symbol]?.price ?? p.currentPrice ?? null

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
  }, [sourcePositions, ws.prices])

  return {
    positions: livePositions
  }
}