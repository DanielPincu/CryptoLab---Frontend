import { useEffect, useRef, useState } from 'react'
import { apiAccountMe } from '../api/account.api'
import { apiUserMe } from '../api/user.api'
import { useAccountStore } from './useAccountStore'
import { usePriceStore } from './usePriceStore'

export type WsPrice = { symbol: string; price: number; ts: number | null; source: 'finnhub' | 'binance' | null }

type WsStatus = 'connecting' | 'open' | 'closed' | 'error'

function normalizeSymbol(s: string) {
  return String(s || '').replace(/^BINANCE:/i, '').toUpperCase().trim()
}

let wsRef: WebSocket | null = null
let reconnectTimer: ReturnType<typeof setTimeout> | null = null
let connectionVersion = 0
let activeSymbolsKey = ''
let activeStatus: WsStatus = 'closed'
let consumerId = 0

const consumers = new Map<number, string[]>()
const statusListeners = new Set<(status: WsStatus) => void>()

function setSharedStatus(status: WsStatus) {
  activeStatus = status
  statusListeners.forEach((listener) => listener(status))
}

function getRequestedSymbols() {
  const storedFavorites = useAccountStore.getState().account?.favorites ?? []
  const symbols = [
    ...storedFavorites.map(normalizeSymbol),
    ...Array.from(consumers.values()).flat()
  ]

  return [...new Set(symbols.filter(Boolean))].sort()
}

function clearReconnectTimer() {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer)
    reconnectTimer = null
  }
}

function closeSharedSocket() {
  clearReconnectTimer()
  connectionVersion += 1
  activeSymbolsKey = ''

  if (wsRef) {
    wsRef.onclose = null
    wsRef.close()
    wsRef = null
  }

  setSharedStatus('closed')
}

async function connectSharedSocket() {
  clearReconnectTimer()

  if (consumers.size === 0) {
    closeSharedSocket()
    return
  }

  const requestedSymbols = getRequestedSymbols()
  const requestedSymbolsKey = requestedSymbols.join(',')

  if (wsRef && activeSymbolsKey === requestedSymbolsKey) {
    return
  }

  const currentVersion = connectionVersion + 1
  connectionVersion = currentVersion
  activeSymbolsKey = requestedSymbolsKey
  setSharedStatus('connecting')

  if (wsRef) {
    wsRef.onclose = null
    wsRef.close()
    wsRef = null
  }

  const storedFavorites = useAccountStore.getState().account?.favorites ?? []

  try {
    const [meRes, accRes] = await Promise.all([
      apiUserMe(),
      storedFavorites.length > 0 ? Promise.resolve(null) : apiAccountMe()
    ])

    if (currentVersion !== connectionVersion || consumers.size === 0) return

    const accountFavorites: string[] = storedFavorites.length > 0
      ? storedFavorites.map(normalizeSymbol)
      : Array.isArray(accRes?.favorites)
        ? accRes.favorites.map(normalizeSymbol)
        : []

    const symbols = [...new Set([...accountFavorites, ...requestedSymbols])].filter(Boolean).sort()
    activeSymbolsKey = symbols.join(',')

    // Ensure WebSocket protocol (ws / wss) instead of http / https
    const httpBase = `${import.meta.env.VITE_API_URL}/market/latest`
    const base = httpBase
      .replace(/^http:/i, 'ws:')
      .replace(/^https:/i, 'wss:')

    const params = new URLSearchParams()
    if (meRes?.id) params.set('userId', meRes.id)
    if (symbols.length) params.set('favorites', symbols.join(','))

    const url = params.toString() ? `${base}?${params.toString()}` : base
    const ws = new WebSocket(url)
    wsRef = ws

    const { setPrice } = usePriceStore.getState()

    ws.onopen = () => {
      if (currentVersion !== connectionVersion) return

      setSharedStatus('open')
      ws.send(JSON.stringify({ type: 'set', symbols }))
    }

    ws.onmessage = (ev) => {
      const data = JSON.parse(String(ev.data))
      const symbol = normalizeSymbol(data?.symbol || data?.s)
      const price = Number(data?.price ?? data?.p)
      const ts = Number(data?.ts ?? data?.time ?? data?.t)
      const source =
        data?.source === 'finnhub' || data?.source === 'binance'
          ? data.source
          : null

      if (!symbol || !Number.isFinite(price)) return

      setPrice(symbol, {
        symbol,
        price,
        ts: Number.isFinite(ts) ? ts : null,
        source
      })
    }

    ws.onerror = () => {
      if (currentVersion === connectionVersion) setSharedStatus('error')
    }

    ws.onclose = () => {
      if (currentVersion !== connectionVersion || consumers.size === 0) return

      setSharedStatus('closed')
      reconnectTimer = setTimeout(connectSharedSocket, 2000)
    }
  } catch {
    if (currentVersion !== connectionVersion || consumers.size === 0) return

    setSharedStatus('error')
    reconnectTimer = setTimeout(connectSharedSocket, 2000)
  }
}

export function useWsPrices(extraSymbols: string[] = []) {
  const [status, setStatus] = useState<WsStatus>(activeStatus)
  const idRef = useRef<number | null>(null)
  const prices = usePriceStore((state) => state.prices)
  const accountSymbolsKey = useAccountStore((state) => (state.account?.favorites ?? [])
    .map(normalizeSymbol)
    .filter(Boolean)
    .sort()
    .join(','))
  const extraSymbolsKey = extraSymbols
    .map(normalizeSymbol)
    .filter(Boolean)
    .sort()
    .join(',')

  useEffect(() => {
    const id = idRef.current ?? consumerId + 1
    consumerId = Math.max(consumerId, id)
    idRef.current = id

    consumers.set(id, extraSymbolsKey.split(',').filter(Boolean))
    statusListeners.add(setStatus)
    void connectSharedSocket()

    return () => {
      consumers.delete(id)
      statusListeners.delete(setStatus)

      if (consumers.size === 0) {
        closeSharedSocket()
      } else {
        void connectSharedSocket()
      }
    }
  }, [accountSymbolsKey, extraSymbolsKey])

  return { status, prices: prices as Record<string, WsPrice> }
}
