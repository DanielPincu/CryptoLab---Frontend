import { useEffect, useRef, useState } from 'react'
import { http } from '../api/http.api'

export type WsPrice = { symbol: string; price: number; time: number }

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
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          setStatus('closed')
          return
        }

        setStatus('connecting')
        setPrices({})

        // close previous socket if any
        if (wsRef.current) {
          try {
            wsRef.current.close()
          } catch (err) {
            console.debug('WS close error', err)
          }
        }

        const [meRes, accRes] = await Promise.all([
          http.get('/user/me'),
          http.get('/account/me')
        ])

        const userId: string | undefined =
          meRes?.data?.user?.id || meRes?.data?._id || meRes?.data?.id

        const favorites: string[] = Array.isArray(accRes?.data?.favorites)
          ? accRes.data.favorites.map(normalizeSymbol)
          : []

        const base = 'http://localhost:3000/market/latest'
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
          try {
            const data = JSON.parse(String(ev.data))

            const symbol = normalizeSymbol(data?.symbol || data?.s)
            const price = Number(data?.price ?? data?.p)
            const time = Number(data?.time ?? data?.t ?? Date.now())

            if (!symbol || !Number.isFinite(price)) return

            setPrices((prev) => ({
              ...prev,
              [symbol]: { symbol, price, time }
            }))
          } catch (err) {
            console.debug('WS parse error', err)
          }
        }

        ws.onerror = () => {
          if (!cancelled) setStatus('error')
        }

        ws.onclose = () => {
          if (cancelled) return
          setStatus('closed')
          timer = setTimeout(connect, 2000)
        }
      } catch {
        setStatus('error')
        timer = setTimeout(connect, 3000)
      }
    }

    connect()

    return () => {
      cancelled = true
      if (timer) clearTimeout(timer)
      try {
        wsRef.current?.close()
      } catch (err) {
        console.debug('WS close error (cleanup)', err)
      }
    }
  }, [])

  return { status, prices }
}