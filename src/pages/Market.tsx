import { useEffect, useMemo, useState } from 'react'
import { http } from '../api/http.api'
import { useWsPrices } from '../state/useWsPrices'
import type { IMarketTick } from '../interfaces/marketTick.interface'

export default function Market() {
  const ws = useWsPrices()
  const [ticks, setTicks] = useState<IMarketTick[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [flash, setFlash] = useState<Record<string, boolean>>({})

  // Initial load (favorites only)
  useEffect(() => {
    http
      .get<IMarketTick[]>('/market/latest')
      .then((res) => setTicks(res.data))
      .catch(() => setError('Failed to load live prices'))
      .finally(() => setLoading(false))
  }, [])

  // Merge live WS prices into ticks and flash rows on update
  useEffect(() => {
    const updates = ws.prices
    if (!updates || !Object.keys(updates).length) return

    queueMicrotask(() => setTicks((prev) => {
      const next = prev.map((t) => {
        const live = updates[t.symbol]?.price
        if (typeof live === 'number' && live !== t.price) {
          // mark flash for this symbol
          setFlash((f) => ({ ...f, [t.symbol]: true }))
          // clear flash shortly after
          setTimeout(() => {
            setFlash((f) => ({ ...f, [t.symbol]: false }))
          }, 350)
          return { ...t, price: live }
        }
        return t
      })

      // Add any new symbols that arrive via WS but were not in initial ticks
      for (const [symbol, v] of Object.entries(updates)) {
        if (!next.find((t) => t.symbol === symbol) && typeof v?.price === 'number') {
          next.push({ symbol, price: v.price })
          setFlash((f) => ({ ...f, [symbol]: true }))
          setTimeout(() => {
            setFlash((f) => ({ ...f, [symbol]: false }))
          }, 350)
        }
      }

      return next
    }))
  }, [ws.prices])

  const rows = useMemo(() => ticks, [ticks])

  if (loading) return <div className="p-6 text-slate-400">Loading market…</div>
  if (error) return <div className="p-6 text-rose-400">{error}</div>

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-xl font-semibold mb-4">Live Prices</h1>

      <div className="text-xs mb-2">
        WS status:{' '}
        <span className={ws.status === 'open' ? 'text-emerald-400' : 'text-amber-400'}>
          {ws.status}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {rows.map((t) => (
          <div
            key={t.symbol}
            className={
              'rounded-lg border border-slate-800 bg-slate-900 p-3 flex justify-between transition ' +
              (flash[t.symbol] ? 'ring-2 ring-emerald-400/60 bg-emerald-400/10' : '')
            }
          >
            <span className="font-mono">{t.symbol}</span>
            <span className="font-semibold text-emerald-400">
              {typeof t.price === 'number' ? t.price.toFixed(4) : 'waiting…'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}