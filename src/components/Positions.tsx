import { useEffect, useMemo, useState } from 'react'
import { useWsPrices } from '../state/useWsPrices'
import { getPositions } from '../api/positions.api'
import type { Position } from '../interfaces/position.interface'
import type { PositionsProps } from '../interfaces/positionProps.interface'

export default function Positions({
  positions,
  selectedSymbol = null,
  onSelect,
  refreshKey,
  onCountChange
}: PositionsProps) {
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
      const marketValue = typeof livePrice === 'number' ? livePrice * p.qty : null
      const unrealizedPnl =
        typeof livePrice === 'number' ? (livePrice - p.avgEntryPrice) * p.qty : null

      return {
        ...p,
        currentPrice: livePrice,
        marketValue,
        unrealizedPnl
      }
    })
  }, [sourcePositions, ws.prices])

  useEffect(() => {
    onCountChange?.(livePositions.length)
  }, [livePositions, onCountChange])

  return (
    <div className="mb-4 p-3 rounded-lg bg-slate-900 border border-slate-800">
      <h1 className="text-xl font-semibold mb-4">Positions</h1>

      {livePositions.length === 0 ? (
        <div className="text-sm text-slate-500">No open positions</div>
      ) : (
        livePositions.map((p) => (
          <div
            key={p._id}
            onClick={() => onSelect?.(p.symbol, p.qty)}
            className={
              "cursor-pointer text-sm py-3 my-3 border-b border-slate-800 last:border-b-0 space-y-1 rounded transition " +
              (selectedSymbol === p.symbol
                ? "bg-slate-800 ring-1 ring-blue-500 p-1"
                : "hover:bg-slate-800/50 ")
            }
          >
            <div className="flex justify-between">
              <span className="font-mono font-semibold">{p.symbol}</span>
              <span>{p.qty.toFixed(6)}</span>
            </div>

            <div className="flex justify-between text-slate-400">
              <span>Avg Entry</span>
              <span>${p.avgEntryPrice.toFixed(4)}</span>
            </div>

            <div className="flex justify-between text-slate-400">
              <span>Current Price</span>
              <span>${typeof p.currentPrice === 'number' ? p.currentPrice.toFixed(4) : '—'}</span>
            </div>

            <div className="flex justify-between text-slate-400">
              <span>Market Value</span>
              <span>${typeof p.marketValue === 'number' ? p.marketValue.toFixed(4) : '—'}</span>
            </div>

            <div
              className={
                "flex justify-between " +
                (typeof p.unrealizedPnl === 'number' && p.unrealizedPnl >= 0
                  ? "text-emerald-400"
                  : "text-rose-400")
              }
            >
              <span>Unrealized PnL</span>
              <span>${typeof p.unrealizedPnl === 'number' ? p.unrealizedPnl.toFixed(4) : '—'}</span>
            </div>
          </div>
        ))
      )}
    </div>
  )
}