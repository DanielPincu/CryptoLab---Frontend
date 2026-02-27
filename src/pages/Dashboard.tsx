import { useEffect, useMemo, useRef, useState } from 'react'
import { http } from '../api/http.api'
import { useWsPrices } from '../state/useWsPrices'
import type { IMarketTick } from '../interfaces/marketTick.interface'
import TradePanel from '../components/TradePanel'

interface Position {
  symbol: string
  qty: number
}

export default function Market() {
  const ws = useWsPrices()

  const [ticks, setTicks] = useState<IMarketTick[]>([])
  const [positions, setPositions] = useState<Position[]>([])
  const [accountCash, setAccountCash] = useState<number>(0)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null)

  const [flash, setFlash] = useState<Record<string, boolean>>({})
  const prevPricesRef = useRef<Record<string, number>>({})

  // Load market + account + positions
  useEffect(() => {
    Promise.all([
      http.get<IMarketTick[]>('/market/latest'),
      http.get('/account/me'),
      http.get<Position[]>('/positions')
    ])
      .then(([marketRes, accountRes, positionsRes]) => {
        setTicks(marketRes.data)
        setAccountCash(accountRes.data?.cashBalance ?? 0)
        setPositions(positionsRes.data ?? [])
      })
      .catch(() => setError('Failed to load data'))
      .finally(() => setLoading(false))
  }, [])

  const selectedTick = useMemo(
    () => ticks.find((t) => t.symbol === selectedSymbol),
    [ticks, selectedSymbol]
  )

  const selectedPositionQty = useMemo(() => {
    if (!selectedSymbol) return undefined
    const pos = positions.find((p) => p.symbol === selectedSymbol)
    return pos?.qty
  }, [positions, selectedSymbol])

  const rows = useMemo(() => {
    if (!ws.prices) return ticks

    return ticks.map((t) => {
      const live = ws.prices[t.symbol]?.price
      return {
        ...t,
        price: typeof live === 'number' ? live : t.price
      }
    })
  }, [ticks, ws.prices])

  useEffect(() => {
    if (!ws.prices) return

    Object.entries(ws.prices).forEach(([symbol, data]) => {
      const live = data?.price
      const prev = prevPricesRef.current[symbol]

      if (typeof live === 'number' && prev !== undefined && live !== prev) {
        setFlash((f) => ({ ...f, [symbol]: true }))
        setTimeout(() => {
          setFlash((f) => ({ ...f, [symbol]: false }))
        }, 350)
      }

      if (typeof live === 'number') {
        prevPricesRef.current[symbol] = live
      }
    })
  }, [ws.prices])

  if (loading) return <div className="p-6 text-slate-400">Loading market…</div>
  if (error) return <div className="p-6 text-rose-400">{error}</div>

  return (
    <div className="p-6 max-w-6xl mx-auto flex gap-6">
      {/* Left: Market */}
      <div className="flex-1">
        <h1 className="text-xl font-semibold mb-4">Live Prices</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {rows.map((t) => (
            <div
              key={t.symbol}
              onClick={() => setSelectedSymbol(t.symbol)}
              className={
                'cursor-pointer rounded-lg border border-slate-800 bg-slate-900 p-3 flex justify-between transition ' +
                (flash[t.symbol] ? 'ring-2 ring-emerald-400/60 bg-emerald-400/10 ' : '') +
                (selectedSymbol === t.symbol ? 'ring-2 ring-blue-500 ' : '')
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

      {/* Right: Trade Panel */}
      <div className="w-96 shrink-0">
        <div className="mb-4 p-3 rounded-lg bg-slate-900 border border-slate-800">
          <div className="text-xs text-slate-400">Buying Power</div>
          <div className="text-lg font-semibold text-emerald-400">
            ${accountCash.toFixed(2)}
          </div>
        </div>
        <TradePanel
          symbol={selectedSymbol ?? undefined}
          currentPrice={selectedTick?.price ?? undefined}
          availableCash={accountCash}
          positionQty={selectedPositionQty}
          onSuccess={() => {
            // refresh after trade
            http.get('/account/me').then((res) =>
              setAccountCash(res.data?.cashBalance ?? 0)
            )
            http.get<Position[]>('/positions').then((res) =>
              setPositions(res.data ?? [])
            )
          }}
        />
      </div>
    </div>
  )
}