import { useEffect } from 'react'
import { usePositions } from '../hooks/usePositions'
import type { PositionsProps } from '../interfaces/positionProps.interface'
import { usePrecisionStore } from '../state/usePrecisionStore'
import { fixed8, money8, percent8 } from '../utils/numberFormat'

export default function Positions({
  positions,
  selectedSymbol = null,
  onSelect,
  refreshKey,
  onCountChange
}: PositionsProps) {
  const { positions: livePositions } = usePositions({
    positions,
    refreshKey
  })
  const precision = usePrecisionStore((state) => state.precision)

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
            onClick={() => onSelect?.(p.symbol)}
            className={
              "cursor-pointer text-sm py-3 my-3 border-b border-slate-800 last:border-b-0 space-y-1 rounded transition " +
              (selectedSymbol === p.symbol
                ? "bg-slate-800 ring-1 ring-blue-500 p-1"
                : "hover:bg-slate-800/50 ")
            }
          >
            <div className="flex justify-between">
              <span className="font-mono font-semibold">{p.symbol}</span>
            </div>

            <div className="flex justify-between text-slate-400">
              <span>Quantity</span>
              <span>{fixed8(p.qty, precision)}</span>
            </div>

            <div className="flex justify-between text-slate-400">
              <span>Avg Entry</span>
              <span>{money8(p.avgEntryPrice, precision)}</span>
            </div>

            <div className="flex justify-between text-slate-400">
              <span>Current Price</span>
              <span>
                {p.currentPrice != null ? money8(p.currentPrice, precision) : '—'}
              </span>
            </div>

            <div className="flex justify-between text-slate-400">
              <span>Market Value</span>
              <span>
                {p.marketValue != null ? money8(p.marketValue, precision) : '—'}
              </span>
            </div>

            <div
              className={
                "flex justify-between " +
                (p.unrealizedPnl != null
                  ? p.unrealizedPnl < 0
                    ? "text-rose-400"
                    : "text-emerald-400"
                  : "text-slate-400")
              }
            >
              <span>Position Cost</span>
              <span>{money8(p.positionCost, precision)}</span>
            </div>

            <div
              className={
                "flex justify-between " +
                (p.unrealizedPnl != null && p.unrealizedPnl >= 0
                  ? "text-emerald-400"
                  : "text-rose-400")
              }
            >
              <span>Unrealized PnL</span>
              <span>
                {p.unrealizedPnl != null
                  ? money8(p.unrealizedPnl, precision)
                  : '—'}
                {p.unrealizedPnlPercent != null && (
                  <span className="ml-2 text-xs">
                    ({percent8(p.unrealizedPnlPercent, precision)})
                  </span>
                )}
              </span>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
