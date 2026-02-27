import { useEffect, useMemo, useRef, useState } from 'react'
import { http } from '../api/http.api'
import { useWsPrices } from '../state/useWsPrices'
import type { IMarketTick } from '../interfaces/marketTick.interface'

interface LivePricesProps {
  selectedSymbol?: string | null
  onSelect?: (symbol: string) => void
}

export default function LivePrices({
  selectedSymbol,
  onSelect
}: LivePricesProps) {
  const ws = useWsPrices()

  const [ticks, setTicks] = useState<IMarketTick[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [flash, setFlash] = useState<Record<string, boolean>>({})
  const prevPricesRef = useRef<Record<string, number>>({})

  // Initial load
  useEffect(() => {
    http
      .get<IMarketTick[]>('/market/latest')
      .then((res) => setTicks(res.data))
      .catch(() => setError('Failed to load live prices'))
      .finally(() => setLoading(false))
  }, [])

  // Merge WS prices
  const rows = useMemo(() => {
    if (!ws.prices) return ticks

    return ticks.map((t) => {
      const live = ws.prices[t.symbol]?.price
      return {
        ...t,
        price: typeof live === 'number' ? live : t.price
      }
    })
  }, [ticks, ws.prices])

  // Flash effect on price change
  useEffect(() => {
    rows.forEach((t) => {
      const prev = prevPricesRef.current[t.symbol]

      if (
        typeof t.price === 'number' &&
        prev !== undefined &&
        t.price !== prev
      ) {
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

  if (loading) return <div className="p-6 text-slate-400">Loading market…</div>
  if (error) return <div className="p-6 text-rose-400">{error}</div>

  return (
    <div className="flex-1">
      <h1 className="text-xl font-semibold mb-4">Live Prices</h1>

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
            <span className="font-mono">{t.symbol}</span>
            <span className="font-semibold text-emerald-400">
              {typeof t.price === 'number'
                ? t.price.toFixed(4)
                : 'waiting…'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}