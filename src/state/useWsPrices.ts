import { useEffect, useRef, useState } from 'react'
import { apiAccountMe } from '../api/account.api'
import { apiUserMe } from '../api/user.api'
import { useAccountStore } from './useAccountStore'
import { usePriceStore } from './usePriceStore'

export type WsPrice = { symbol: string; price: number; time: number; source?: 'finnhub' | 'binance' | 'backup' }

function normalizeSymbol(s: string) {
  return String(s || '').replace(/^BINANCE:/i, '').toUpperCase().trim()
}

export function useWsPrices(extraSymbols: string[] = []) {
  const [status, setStatus] = useState<'connecting' | 'open' | 'closed' | 'error'>('connecting')
  const wsRef = useRef<WebSocket | null>(null)
  const prices = usePriceStore((state) => state.prices)
  const extraSymbolsKey = extraSymbols
    .map(normalizeSymbol)
    .filter(Boolean)
    .sort()
    .join(',')

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null
    let cancelled = false
    const { setBulkPrices, setPrice } = usePriceStore.getState()

    async function connect() {
      setStatus('connecting')
      setBulkPrices({})

      // close previous socket if any
      if (wsRef.current) {
        wsRef.current.close()
      }

      const storedFavorites = useAccountStore.getState().account?.favorites ?? []

      const [meRes, accRes] = await Promise.all([
        apiUserMe(),
        storedFavorites.length > 0 ? Promise.resolve(null) : apiAccountMe()
      ])

      const userId: string | undefined = meRes?.id

      const favorites: string[] = storedFavorites.length > 0
        ? storedFavorites.map(normalizeSymbol)
        : Array.isArray(accRes?.favorites)
          ? accRes.favorites.map(normalizeSymbol)
          : []
      const requestedSymbols = [...new Set([...favorites, ...extraSymbolsKey.split(',').filter(Boolean)])]

      // Ensure WebSocket protocol (ws / wss) instead of http / https
      const httpBase = `${import.meta.env.VITE_API_URL}/market/latest`
      const base = httpBase
        .replace(/^http:/i, 'ws:')
        .replace(/^https:/i, 'wss:')

      const params = new URLSearchParams()
      if (userId) params.set('userId', userId)
      if (requestedSymbols.length) params.set('favorites', requestedSymbols.join(','))

      const url = params.toString() ? `${base}?${params.toString()}` : base

      const ws = new WebSocket(url)
      wsRef.current = ws

      ws.onopen = () => {
        if (!cancelled) setStatus('open')
      }

      ws.onmessage = (ev) => {
        const data = JSON.parse(String(ev.data))

        const symbol = normalizeSymbol(data?.symbol || data?.s)
        const price = Number(data?.price ?? data?.p)
        const source =
          data?.source === 'finnhub' || data?.source === 'binance'
            ? data.source
            : undefined

        if (!symbol || !Number.isFinite(price)) return

        setPrice(symbol, { symbol, price, source })
      }

      ws.onerror = () => {
        if (!cancelled) setStatus('error')
      }

      ws.onclose = () => {
        if (cancelled) return
        setStatus('closed')
        timer = setTimeout(connect, 2000)
      }
      
    }

    connect()

    return () => {
      cancelled = true
      if (timer) clearTimeout(timer)
      wsRef.current?.close()
    }
  }, [extraSymbolsKey])

  return { status, prices: prices as Record<string, WsPrice> }
}
