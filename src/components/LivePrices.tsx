import { useEffect, useMemo, useRef, useState } from 'react'
import { http } from '../api/http.api'
import { apiAccountMe, apiAccountRemoveFavorite, apiAccountResetFavorites } from '../api/account.api'
import type { IAccount } from '../interfaces/account.interface'
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
  const [account, setAccount] = useState<IAccount | null>(null)
  const [updating, setUpdating] = useState(false)

  const [flash, setFlash] = useState<Record<string, boolean>>({})
  const prevPricesRef = useRef<Record<string, number>>({})

  // Initial load
  useEffect(() => {
    async function load() {
      try {
        const [market, acc] = await Promise.all([
          http.get<IMarketTick[]>('/market/latest'),
          apiAccountMe()
        ])

        setTicks(market.data)
        setAccount(acc)
      } catch {
        setError('Failed to load live prices')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  // Merge WS prices
  const rows = useMemo(() => {
    if (!ws.prices) return ticks

    return ticks
      .filter((t) => !account?.favorites || account.favorites.includes(t.symbol))
      .map((t) => {
        const live = ws.prices[t.symbol]?.price
        return {
          ...t,
          price: typeof live === 'number' ? live : t.price
        }
      })
  }, [ticks, ws.prices, account])
  const handleRemoveFavorite = async (symbol: string) => {
    try {
      setUpdating(true)
      const updated = await apiAccountRemoveFavorite(symbol)
      setAccount((prev) => (prev ? { ...prev, favorites: updated.favorites } : prev))
    } finally {
      setUpdating(false)
    }
  }

  const handleResetFavorites = async () => {
    try {
      setUpdating(true)
      const updated = await apiAccountResetFavorites()
      setAccount((prev) => (prev ? { ...prev, favorites: updated.favorites } : prev))
    } finally {
      setUpdating(false)
    }
  }

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
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Live Prices</h1>
        <button
          onClick={handleResetFavorites}
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
                  handleRemoveFavorite(t.symbol)
                }}
                disabled={updating}
                className="text-rose-400 hover:text-rose-300 text-xs font-bold"
              >
                ✕
              </button>
            </div>
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