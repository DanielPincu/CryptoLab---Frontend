import { memo } from 'react'
import type { CSSProperties } from 'react'
import type {
  IMarketTickerProps,
  IMarketTickerRow
} from '../interfaces/marketTicker.interface'
import { useMarketTicker } from '../hooks/useMarketTicker'

function MarketTickerItem({ row }: { row: IMarketTickerRow }) {
  const isUp = row.move.direction === 'up'
  const isDown = row.move.direction === 'down'

  return (
    <div className="flex shrink-0 items-center gap-3 border-r border-emerald-400/10 px-4 font-mono text-[11px] [font-variant-numeric:tabular-nums] sm:text-xs">
      <span className="shrink-0 font-semibold tracking-wide text-slate-100">
        {row.displaySymbol}
      </span>

      <span className="shrink-0 text-slate-300">
        {row.priceLabel}
      </span>

      <span
        className={
          'shrink-0 font-semibold ' +
          (isUp
            ? 'text-emerald-300 drop-shadow-[0_0_6px_rgba(52,211,153,0.45)]'
            : isDown
              ? 'text-rose-300 drop-shadow-[0_0_6px_rgba(251,113,133,0.35)]'
              : 'text-slate-500')
        }
      >
        {isUp ? '▲' : isDown ? '▼' : '•'}
        {row.percentLabel}
      </span>
    </div>
  )
}

const MemoTickerItem = memo(MarketTickerItem)

export default function MarketTicker({
  className = '',
  maxItems = 48,
  symbols
}: IMarketTickerProps) {
  const { rows, status, duration } = useMarketTicker({ maxItems, symbols })
  const tickerStyle = {
    '--ticker-duration': `${duration}s`
  } as CSSProperties

  if (rows.length === 0) {
    return (
      <div className={`h-9 overflow-hidden border-b border-emerald-400/10 bg-slate-950 text-xs text-slate-500 ${className}`}>
        <div className="flex h-full items-center px-4 font-mono uppercase tracking-[0.2em]">
          Market feed {status}
        </div>
      </div>
    )
  }

  return (
    <div
      className={`group relative h-9 overflow-hidden border-y border-emerald-400/10 bg-slate-950 shadow-[inset_0_1px_0_rgba(16,185,129,0.08),inset_0_-1px_0_rgba(16,185,129,0.08)] ${className}`}
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-6 bg-gradient-to-r from-slate-950 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-6 bg-gradient-to-l from-slate-950 to-transparent" />

      <div
        className="flex h-full w-max items-center whitespace-nowrap [animation:market-ticker-scroll_var(--ticker-duration)_linear_infinite] group-hover:[animation-play-state:paused]"
        style={tickerStyle}
      >
        <div className="flex h-full items-center">
          {rows.map((row) => (
            <MemoTickerItem key={row.symbol} row={row} />
          ))}
        </div>
        <div className="flex h-full items-center" aria-hidden="true">
          {rows.map((row) => (
            <MemoTickerItem key={`${row.symbol}-duplicate`} row={row} />
          ))}
        </div>
      </div>
    </div>
  )
}
