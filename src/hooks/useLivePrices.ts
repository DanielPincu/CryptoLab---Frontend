import { useEffect, useMemo, useState } from 'react'
import {
  apiAccountRemoveFavorite,
  apiAccountResetFavorites
} from '../api/account.api'
import type { IMarketTick } from '../interfaces/marketTick.interface'
import { loadAccountIntoStore, loadLatestPricesIntoStore } from '../state/storeLoaders'
import { useAccountStore } from '../state/useAccountStore'
import { usePriceStore } from '../state/usePriceStore'

const EMPTY_FAVORITES: string[] = []

export function useLivePrices() {
  const [ticks, setTicks] = useState<IMarketTick[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updating, setUpdating] = useState(false)
  const favorites = useAccountStore((state) => state.account?.favorites ?? EMPTY_FAVORITES)
  const updateFavorites = useAccountStore((state) => state.updateFavorites)
  const livePriceMap = usePriceStore((state) => state.prices)

  // initial load
  useEffect(() => {
    async function load() {
      try {
        const [market] = await Promise.all([
          loadLatestPricesIntoStore(),
          loadAccountIntoStore()
        ])
        setTicks(market)
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
    return ticks
      .filter((t) => favorites.length === 0 || favorites.includes(t.symbol))
      .map((t) => {
        const live = livePriceMap[t.symbol]

        return {
          ...t,
          price: typeof live?.price === 'number' ? live.price : t.price,
          ts: live?.ts ?? t.ts ?? null,
          source: live?.source ?? t.source ?? null
        }
      })
  }, [favorites, livePriceMap, ticks])

  const removeFavorite = async (symbol: string) => {
    setUpdating(true)
    try {
      const updated = await apiAccountRemoveFavorite(symbol)
      updateFavorites(updated.favorites)
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
      updateFavorites(updated.favorites)
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
