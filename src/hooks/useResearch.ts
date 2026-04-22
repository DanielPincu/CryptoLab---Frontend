import { useEffect, useMemo, useState, useCallback } from 'react'
import {
  apiMarketSymbols,
  apiMarketQuote
} from '../api/market.api'
import {
  apiAccountAddFavorite,
  apiAccountRemoveFavorite
} from '../api/account.api'
import { loadAccountIntoStore } from '../state/storeLoaders'
import { useAccountStore } from '../state/useAccountStore'

export type HistoryPreset = 'day' | 'week' | 'month' | '6m' | 'year'
const EMPTY_FAVORITES: string[] = []

function normalizeSymbol(s: string) {
  return String(s || '').replace(/^BINANCE:/i, '').toUpperCase().trim()
}

export function useResearch() {
  const [symbols, setSymbols] = useState<Array<{ symbol: string }>>([])
  const [symbol, setSymbol] = useState<string>('BTCUSDT')
  const [preset, setPreset] = useState<HistoryPreset>('year')
  const [historyStatus] = useState('') // kept for UI
  const [error, setError] = useState<string | null>(null)
  const [warning, setWarning] = useState<string | null>(null)
  const [quote, setQuote] = useState<{ price?: number; ts?: number } | null>(null)
  const [favLoading, setFavLoading] = useState(false)
  const favorites = useAccountStore((state) => state.account?.favorites ?? EMPTY_FAVORITES)
  const updateFavorites = useAccountStore((state) => state.updateFavorites)

  const [showPositions, setShowPositions] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    const saved = localStorage.getItem('research:positions')
    if (!saved) return false
    return saved === 'open'
  })
  const [positionsRefreshKey, setPositionsRefreshKey] = useState(0)

  // --- quote ---
  const loadQuote = useCallback(async (nextSymbol: string = symbol) => {
    try {
      const q = await apiMarketQuote(nextSymbol)
      setQuote({
        price: Number(q?.price),
        ts: Number(q?.ts)
      })
    } catch {
      // silent fail
    }
  }, [symbol])

  const loadAccount = useCallback(async () => {
    try {
      await loadAccountIntoStore()
    } catch {
      // silent fail
    }
  }, [])

  // --- init ---
  useEffect(() => {
    const init = async () => {
      try {
        const [symbolData, me] = await Promise.all([
          apiMarketSymbols(),
          loadAccountIntoStore()
        ])

        setSymbols(symbolData)
        updateFavorites((me?.favorites ?? []).map((s: string) => normalizeSymbol(s)))
      } catch {
        setError('Failed to load data')
      }
    }

    void init()
  }, [updateFavorites])

  // --- favorite state ---
  const isFavorite = favorites.includes(symbol)

  async function handleAddFavorite() {
    try {
      setFavLoading(true)
      const res = await apiAccountAddFavorite(symbol)
      updateFavorites(res.favorites.map((s: string) => normalizeSymbol(s)))
    } finally {
      setFavLoading(false)
    }
  }

  async function handleRemoveFavorite() {
    try {
      setFavLoading(true)
      const res = await apiAccountRemoveFavorite(symbol)
      updateFavorites(res.favorites.map((s: string) => normalizeSymbol(s)))
    } catch (err: unknown) {
      let message = 'Cannot unsubscribe while position is open'

      if (typeof err === 'object' && err && 'response' in err) {
        const e = err as { response?: { data?: { error?: string } } }
        if (e.response?.data?.error) {
          message = e.response.data.error
        }
      }

      setWarning(message)
      setTimeout(() => setWarning(null), 3000)
    } finally {
      setFavLoading(false)
    }
  }

  // --- presets ---
  const presetButtons = useMemo(
    () =>
      ([
        ['day', { label: 'Last day' }],
        ['week', { label: 'Last week' }],
        ['month', { label: 'Last month' }],
        ['6m', { label: 'Last 6 months' }],
        ['year', { label: 'Last year' }]
      ] as Array<[HistoryPreset, { label: string }]>),
    []
  )

  return {
    symbols,
    symbol, setSymbol,
    preset, setPreset,
    historyStatus,
    error,
    warning,
    quote,
    favorites,
    favLoading,
    showPositions, setShowPositions,
    positionsRefreshKey, setPositionsRefreshKey,
    isFavorite,
    handleAddFavorite,
    handleRemoveFavorite,
    presetButtons,
    loadQuote,
    loadAccount,
  }
}
