import { useEffect, useMemo, useState } from 'react'
import { http } from '../api/http.api'
import {
  apiAccountMe,
  apiAccountRemoveFavorite,
  apiAccountResetFavorites
} from '../api/account.api'
import { useWsPrices } from '../state/useWsPrices'
import type { IAccount } from '../interfaces/account.interface'
import type { IMarketTick } from '../interfaces/marketTick.interface'

export function useLivePrices() {
  const ws = useWsPrices()

  const [ticks, setTicks] = useState<IMarketTick[]>([])
  const [account, setAccount] = useState<IAccount | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updating, setUpdating] = useState(false)

  // initial load
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

  // merged + filtered rows
  const rows = useMemo(() => {
    if (!ws.prices) return ticks

    return ticks
      .filter((t) => !account?.favorites || account.favorites.includes(t.symbol))
      .map((t) => {
        const live = ws.prices[t.symbol]

        return {
          ...t,
          price: typeof live?.price === 'number' ? live.price : t.price,
          source: live?.source ?? t.source ?? (live ? 'finnhub' : 'binance')
        }
      })
  }, [ticks, ws.prices, account])

  const removeFavorite = async (symbol: string) => {
    setUpdating(true)
    try {
      const updated = await apiAccountRemoveFavorite(symbol)
      setAccount((prev) =>
        prev ? { ...prev, favorites: updated.favorites } : prev
      )
      return null
    } catch (err: unknown) {
      return (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Cannot unsubscribe while position is open'
    } finally {
      setUpdating(false)
    }
  }

  const resetFavorites = async () => {
    setUpdating(true)
    try {
      const updated = await apiAccountResetFavorites()
      setAccount((prev) =>
        prev ? { ...prev, favorites: updated.favorites } : prev
      )
    } finally {
      setUpdating(false)
    }
  }

  return {
    rows,
    loading,
    error,
    updating,
    removeFavorite,
    resetFavorites
  }
}