import { useEffect } from 'react'
import { usePositions } from '../hooks/usePositions'
import type { PositionsProps } from '../interfaces/positionProps.interface'

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
              <span>{p.qty.toFixed(8)}</span>
            </div>

            <div className="flex justify-between text-slate-400">
              <span>Avg Entry</span>
              <span>${p.avgEntryPrice.toFixed(4)}</span>
            </div>

            <div className="flex justify-between text-slate-400">
              <span>Current Price</span>
              <span>
                ${p.currentPrice != null ? p.currentPrice.toFixed(4) : '—'}
              </span>
            </div>

            <div className="flex justify-between text-slate-400">
              <span>Market Value</span>
              <span>
                ${p.marketValue != null ? p.marketValue.toFixed(4) : '—'}
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
              <span>${p.positionCost.toFixed(4)}</span>
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
                ${p.unrealizedPnl != null
                  ? p.unrealizedPnl.toFixed(4)
                  : '—'}
                {p.unrealizedPnlPercent != null && (
                  <span className="ml-2 text-xs">
                    ({p.unrealizedPnlPercent.toFixed(2)}%)
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
