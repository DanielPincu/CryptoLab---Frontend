import { useEffect, useRef, useState } from 'react'
import { useLivePrices } from '../hooks/useLivePrices'

interface Props {
  selectedSymbol?: string | null
  onSelect?: (symbol: string) => void
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
  const prevPricesRef = useRef<Record<string, number>>({})

  // flash effect
  useEffect(() => {
    rows.forEach((t) => {
      const prev = prevPricesRef.current[t.symbol]

      if (typeof t.price === 'number' && prev !== undefined && t.price !== prev) {
        setFlash((f) => ({ ...f, [t.symbol]: true }))
        setTimeout(() => {
          setFlash((f) => ({ ...f, [t.symbol]: false }))
        }, 350)
      }

      if (typeof t.price === 'number') {
        prevPricesRef.current[t.symbol] = t.price
      }
    })
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
        {rows.map((t) => (
          <div
            key={t.symbol}
            onClick={() => onSelect?.(t.symbol)}
            className={
              'cursor-pointer rounded-lg border border-slate-800 bg-slate-900 p-3 flex justify-between transition ' +
              (flash[t.symbol]
                ? 'ring-2 ring-emerald-400/60 bg-emerald-400/10 '
                : '') +
              (selectedSymbol === t.symbol ? 'ring-2 ring-blue-500 ' : '')
            }
          >
            <div className="flex items-center justify-between w-24">
              <span className="font-mono truncate">{t.symbol}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleRemove(t.symbol)
                }}
                disabled={updating}
                className="text-rose-400 hover:text-rose-300 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-semibold text-emerald-400">
                {typeof t.price === 'number' ? t.price.toFixed(4) : 'waiting…'}
              </span>

              {typeof t.price === 'number' && (
                <span
                  className={
                    'text-[10px] w-20 text-center py-0.5 rounded ' +
                    (t.source === 'binance'
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-emerald-500/20 text-emerald-400')
                  }
                >
                  {t.source === 'binance' ? 'LIVE' : 'LIVE'}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}