import { useEffect, useMemo, useState, useCallback } from 'react'
import {
  apiMarketSymbols,
  apiMarketQuote
} from '../api/market.api'
import {
  apiAccountMe,
  apiAccountAddFavorite,
  apiAccountRemoveFavorite
} from '../api/account.api'

export type HistoryPreset = 'day' | 'week' | 'month' | '6m' | 'year'

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

  const [favorites, setFavorites] = useState<string[]>([])
  const [accountCash, setAccountCash] = useState<number>(0)
  const [favLoading, setFavLoading] = useState(false)

  const [showPositions, setShowPositions] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    const saved = localStorage.getItem('research:positions')
    if (!saved) return false
    return saved === 'open'
  })

  const [selectedPositionQty, setSelectedPositionQty] = useState<number>(0)
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
      const me = await apiAccountMe()
      setFavorites((me?.favorites ?? []).map((s: string) => normalizeSymbol(s)))
      setAccountCash(Number(me?.cashBalance ?? 0))
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
          apiAccountMe()
        ])

        setSymbols(symbolData)
        setFavorites((me?.favorites ?? []).map((s: string) => normalizeSymbol(s)))
        setAccountCash(Number(me?.cashBalance ?? 0))
      } catch {
        setError('Failed to load data')
      }
    }

    void init()
  }, [])

  // --- favorite state ---
  const isFavorite = favorites.includes(symbol)

  async function handleAddFavorite() {
    try {
      setFavLoading(true)
      const res = await apiAccountAddFavorite(symbol)
      setFavorites(res.favorites.map((s: string) => normalizeSymbol(s)))
    } finally {
      setFavLoading(false)
    }
  }

  async function handleRemoveFavorite() {
    try {
      setFavLoading(true)
      const res = await apiAccountRemoveFavorite(symbol)
      setFavorites(res.favorites.map((s: string) => normalizeSymbol(s)))
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
    accountCash,
    favLoading,
    showPositions, setShowPositions,
    selectedPositionQty, setSelectedPositionQty,
    positionsRefreshKey, setPositionsRefreshKey,
    isFavorite,
    handleAddFavorite,
    handleRemoveFavorite,
    presetButtons,
    loadQuote,
    loadAccount,
  }
}