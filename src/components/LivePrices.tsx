import { useEffect, useRef, useState } from 'react'
import { useLivePrices } from '../hooks/useLivePrices'

type Direction = 'up' | 'down' | 'flat'

interface Props {
  selectedSymbol?: string | null
  onSelect?: (symbol: string) => void
}

interface PriceMove {
  direction: Direction
  percent: number
}

export default function LivePrices({ selectedSymbol, onSelect }: Props) {
  const {
    rows,
    loading,
    error,
    updating,
    removeFavorite,
    resetFavorites
  } = useLivePrices()

  const [warning, setWarning] = useState<string | null>(null)
  const [flash, setFlash] = useState<Record<string, boolean>>({})
  const [moves, setMoves] = useState<Record<string, PriceMove>>({})
  const initialPricesRef = useRef<Record<string, number>>({})
  const prevPricesRef = useRef<Record<string, number>>({})

  // Flash on every live tick, but keep the arrow based on movement from the first observed price.
  useEffect(() => {
    const nextMoves: Record<string, PriceMove> = {}
    let moveChanged = false

    rows.forEach((t) => {
      const prev = prevPricesRef.current[t.symbol]

      if (typeof t.price === 'number' && prev !== undefined && t.price !== prev) {
        setFlash((f) => ({ ...f, [t.symbol]: true }))
        setTimeout(() => {
          setFlash((f) => ({ ...f, [t.symbol]: false }))
        }, 350)
      }

      if (typeof t.price === 'number') {
        if (initialPricesRef.current[t.symbol] === undefined) {
          initialPricesRef.current[t.symbol] = t.price
        }

        const initialPrice = initialPricesRef.current[t.symbol]

        if (initialPrice && initialPrice !== t.price) {
          const percent = ((t.price - initialPrice) / initialPrice) * 100

          nextMoves[t.symbol] = {
            direction: percent > 0 ? 'up' : percent < 0 ? 'down' : 'flat',
            percent
          }

          moveChanged = true
        }

        prevPricesRef.current[t.symbol] = t.price
      }
    })

    if (moveChanged) {
      setMoves((current) => ({ ...current, ...nextMoves }))
    }
  }, [rows])

  const handleRemove = async (symbol: string) => {
    const err = await removeFavorite(symbol)
    if (err) {
      setWarning(err)
      setTimeout(() => setWarning(null), 3000)
    }
  }

  if (loading) return <div className="p-6 text-slate-400">Loading market…</div>
  if (error) return <div className="p-6 text-rose-400">{error}</div>

  return (
    <div className="flex-1">
      {warning && (
        <div className="mb-3 rounded-md border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
          {warning}
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Live Prices</h1>
        <button
          onClick={resetFavorites}
          disabled={updating}
          className="px-3 py-1.5 text-xs rounded bg-amber-600 text-white disabled:opacity-50"
        >
          Reset
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {rows.map((t) => {
          const move = moves[t.symbol] ?? { direction: 'flat' as const, percent: 0 }
          const isUp = move.direction === 'up'
          const isDown = move.direction === 'down'

          return (
            <div
              key={t.symbol}
              onClick={() => onSelect?.(t.symbol)}
              className={
                'cursor-pointer rounded-lg border border-slate-800 bg-slate-900/90 p-3 transition hover:border-slate-700 hover:bg-slate-900 ' +
                (flash[t.symbol]
                  ? 'ring-2 ring-emerald-400/60 bg-emerald-400/10 '
                  : '') +
                (selectedSymbol === t.symbol ? 'ring-2 ring-blue-500 ' : '')
              }
            >
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
                <div className="min-w-0">
                  <div className="grid min-w-0 grid-cols-[5.0rem_auto] items-center">
                    <span className="truncate font-mono text-sm font-semibold tracking-wide text-slate-100">
                      {t.symbol}
                    </span>

                    <div className="inline-flex w-fit items-center">
                      {typeof t.price === 'number' && (
                        <span
                          className={
                            'flex w-10 shrink-0 items-center justify-center rounded-l border border-r-0 px-1.5 py-0.5 text-center text-[9px] font-semibold leading-none tracking-wide ' +
                            (t.source === 'binance'
                              ? 'border-amber-400/30 bg-amber-500/20 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.12)]'
                              : 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300')
                          }
                        >
                          LIVE
                        </span>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRemove(t.symbol)
                        }}
                        disabled={updating}
                        className="flex h-[18px] w-5 shrink-0 items-center justify-center rounded-r border border-slate-700 bg-slate-950/60 text-[10px] font-bold leading-none text-slate-500 transition hover:border-rose-300/40 hover:bg-rose-400/10 hover:text-rose-300 disabled:opacity-50"
                        aria-label={`Remove ${t.symbol}`}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex min-w-[8.5rem] flex-col items-end gap-1 font-mono [font-variant-numeric:tabular-nums]">
                  <span className="text-right text-base font-semibold leading-5 text-emerald-300">
                    {typeof t.price === 'number' ? t.price.toFixed(4) : 'waiting…'}
                  </span>

                  {typeof t.price === 'number' && (
                    <span
                      className={
                        'text-xs font-semibold leading-4 ' +
                        (isUp
                          ? 'text-emerald-300 drop-shadow-[0_0_6px_rgba(52,211,153,0.45)]'
                          : isDown
                            ? 'text-rose-300 drop-shadow-[0_0_6px_rgba(251,113,133,0.35)]'
                            : 'text-slate-500')
                      }
                    >
                      {isUp ? '▲' : isDown ? '▼' : '•'}
                      {Math.abs(move.percent).toFixed(5)}%
                    </span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
