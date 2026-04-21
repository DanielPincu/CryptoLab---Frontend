import { useEffect, useRef, useState } from 'react'
import { get } from '../api/http.api'

export type WsPrice = { symbol: string; price: number; time: number; source?: 'finnhub' | 'binance' | 'backup' }

function normalizeSymbol(s: string) {
  return String(s || '').replace(/^BINANCE:/i, '').toUpperCase().trim()
}

export function useWsPrices() {
  const [status, setStatus] = useState<'connecting' | 'open' | 'closed' | 'error'>('connecting')
  const [prices, setPrices] = useState<Record<string, WsPrice>>({})
  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null
    let cancelled = false

    async function connect() {
      setStatus('connecting')
      setPrices({})

      // close previous socket if any
      if (wsRef.current) {
        wsRef.current.close()
      }

      const [meRes, accRes] = await Promise.all([
        get('/user/me'),
        get('/account/me')
      ])

      const userId: string | undefined =
        meRes?.user?.id || meRes?._id || meRes?.id

      const favorites: string[] = Array.isArray(accRes?.favorites)
        ? accRes.favorites.map(normalizeSymbol)
        : []

      // Ensure WebSocket protocol (ws / wss) instead of http / https
      const httpBase = `${import.meta.env.VITE_API_URL}/market/latest`
      const base = httpBase
        .replace(/^http:/i, 'ws:')
        .replace(/^https:/i, 'wss:')

      const params = new URLSearchParams()
      if (userId) params.set('userId', userId)
      if (favorites.length) params.set('favorites', favorites.join(','))

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
        const time = Number(data?.time ?? data?.t ?? Date.now())
        const source = data?.source as 'finnhub' | 'binance' | 'backup' | undefined

        if (!symbol || !Number.isFinite(price)) return

        setPrices((prev) => ({
          ...prev,
          [symbol]: { symbol, price, time, source }
        }))
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
  }, [])

  return { status, prices }
}