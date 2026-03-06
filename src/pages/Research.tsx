import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { Chart } from 'chart.js/auto'
import TradePanel from '../components/TradePanel'
import Positions from '../components/Positions'
import ResearchGraph from '../components/ResearchGraph'
import {
  apiMarketSymbols,
  apiMarketHistory,
  apiMarketQuote
} from '../api/market.api'
import {
  apiAccountMe,
  apiAccountAddFavorite,
  apiAccountRemoveFavorite
} from '../api/account.api'

type HistoryPreset = 'day' | 'week' | 'month' | '6m' | 'year'

const PRESETS: Record<HistoryPreset, { interval: string; limit: number; label: string }> = {
  day: { interval: '1h', limit: 24, label: 'Last day' },
  week: { interval: '1d', limit: 7, label: 'Last week' },
  month: { interval: '1d', limit: 30, label: 'Last month' },
  '6m': { interval: '1w', limit: 26, label: 'Last 6 months' },
  year: { interval: '1w', limit: 52, label: 'Last year' }
}

function normalizeSymbol(s: string) {
  return String(s || '').replace(/^BINANCE:/i, '').toUpperCase().trim()
}

export default function Research() {
  const [symbols, setSymbols] = useState<Array<{ symbol: string }>>([])
  const [symbol, setSymbol] = useState<string>('BTCUSDT')
  const [preset, setPreset] = useState<HistoryPreset>('year')
  const [historyStatus, setHistoryStatus] = useState('')
  const [error, setError] = useState<string | null>(null)
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

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const chartRef = useRef<Chart | null>(null)

  const loadHistory = useCallback(
    async (nextPreset: HistoryPreset = preset, nextSymbol: string = symbol) => {
      setHistoryStatus('Loading…')
      const cfg = PRESETS[nextPreset]

      try {
        const res = await apiMarketHistory(nextSymbol, cfg.interval, cfg.limit)

        const labels = res.candles.map((c) =>
          new Date(c.time).toLocaleDateString()
        )
        const closes = res.candles.map((c) => c.close)

        const ctx = canvasRef.current?.getContext('2d')
        if (!ctx) return

        if (chartRef.current) chartRef.current.destroy()

        chartRef.current = new Chart(ctx, {
          type: 'line',
          data: {
            labels,
            datasets: [
              {
                label: `${nextSymbol} (${cfg.label})`,
                data: closes,
                tension: 0.25,
                borderColor: '#10b981',
                backgroundColor: '#10b981'
              }
            ]
          },
          options: {
            responsive: true,
            plugins: {
              legend: { display: true }
            },
            scales: {
              x: {
                ticks: { maxTicksLimit: 8 }
              },
              y: {
                display: true
              }
            }
          }
        })

        setHistoryStatus('')
      } catch {
        setHistoryStatus('Failed to load history')
      }
    },
    [preset, symbol]
  )

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
    // Load initial chart for default symbol
  }, [loadHistory, loadQuote])

  useEffect(() => {
    if (symbol) {
      void loadQuote(symbol)
    }
  }, [symbol, loadQuote])

  useEffect(() => {
    try {
      localStorage.setItem('research:positions', showPositions ? 'open' : 'closed')
    } catch {
      // ignore storage errors
    }
  }, [showPositions])

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
    } finally {
      setFavLoading(false)
    }
  }


  const presetButtons = useMemo(
    () => Object.entries(PRESETS) as Array<[HistoryPreset, typeof PRESETS[HistoryPreset]]>,
    []
  )

  return (
    <div className="p-6 mx-auto overflow-x-hidden h-screen overflow-y-hidden">
      <h1 className="text-xl font-semibold mb-4">Research</h1>

      {error && (
        <div className="text-rose-400 mb-4 text-sm">{error}</div>
      )}

      <div className="flex flex-wrap items-center gap-4 mb-4">
        <select
          value={symbol}
          onChange={(e) => {
            const v = normalizeSymbol(e.target.value)
            setSymbol(v)
            setPreset('year')
          }}
          className="w-96 px-3 py-2 rounded bg-slate-800 border border-slate-700"
        >
          {symbols.map((s) => (
            <option key={s.symbol} value={s.symbol.replace(/^BINANCE:/, '')}>
              {s.symbol.replace(/^BINANCE:/, '')}
            </option>
          ))}
        </select>

        <div className="flex flex-wrap gap-2">
          {presetButtons.map(([k, cfg]) => (
            <button
              key={k}
              onClick={() => {
                setPreset(k)
              }}
              className={
                'px-3 py-1.5 rounded-full border border-slate-800 text-sm transition ' +
                (preset === k
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 font-semibold'
                  : 'bg-slate-900')
              }
            >
              {cfg.label}
            </button>
          ))}
        </div>

        {isFavorite ? (
          <button
            onClick={handleRemoveFavorite}
            disabled={favLoading}
            className="px-3 py-1.5 rounded-lg border border-rose-500/40 bg-rose-500/10 text-rose-300 text-sm disabled:opacity-50"
          >
            Remove from Favorites
          </button>
        ) : (
          <button
            onClick={handleAddFavorite}
            disabled={favLoading}
            className="px-3 py-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 text-sm disabled:opacity-50"
          >
            Add to Favorites
          </button>
        )}

        <span className="text-xs text-slate-400">{historyStatus}</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
          <div className="text-xs text-slate-400">Quote (REST)</div>
          <div className="mt-1 font-semibold text-emerald-300">
            {quote?.price ? quote.price.toFixed(4) : '—'}
          </div>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
          <div className="text-xs text-slate-400">Quote Time</div>
          <div className="mt-1 font-semibold">
            {quote?.ts ? new Date(quote.ts).toLocaleString() : '—'}
          </div>
        </div>
      </div>

      <div className="grid items-start gap-4 min-w-0 grid-cols-1 lg:grid-cols-12">
        <div className={`min-w-0 ${showPositions ? 'lg:col-span-7' : 'lg:col-span-8'} rounded-lg border border-slate-800 bg-slate-950 p-3 h-[520px] lg:h-[600px]`}>
          <ResearchGraph
            key={`${symbol}-${preset}-${showPositions}`}
            symbol={symbol}
            preset={preset}
          />
        </div>

        <div className={`min-w-0 ${showPositions ? 'lg:col-span-3' : 'lg:col-span-3'} rounded-lg border border-slate-800 bg-slate-950 p-3`}>
          <TradePanel
            symbol={symbol}
            currentPrice={quote?.price}
            availableCash={accountCash}
            positionQty={selectedPositionQty}
            onSuccess={async () => {
              void loadQuote(symbol)

              try {
                const me = await apiAccountMe()
                setAccountCash(Number(me?.cashBalance ?? 0))
                setPositionsRefreshKey((k) => k + 1)
              } catch {
                // ignore refresh error
              }
            }}
          />
        </div>

        {/* Positions Drawer */}
        <div className={`relative hidden lg:flex items-start ${showPositions ? 'lg:col-span-2' : 'lg:col-span-1'}`}>
          <div
            className={`overflow-hidden transform transition-transform duration-500 ease-in-out ${
              showPositions
                ? 'translate-x-0 opacity-100'
                : 'translate-x-full opacity-0 pointer-events-none'
            }`}
          >
            <button
              onClick={() => setShowPositions(false)}
              className="mb-2 w-full flex items-center justify-between px-4 py-2 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 transition"
            >
              <span className="text-sm font-semibold text-slate-300 uppercase">Positions</span>
              <span className="text-slate-400">→</span>
            </button>

            <div className="overflow-y-auto w-64 pr-2  max-h-[calc(100vh-260px)]">
              <Positions
                selectedSymbol={symbol}
                refreshKey={positionsRefreshKey}
                onSelect={(sym, qty) => {
                  setSymbol(sym)
                  setSelectedPositionQty(qty)
                }}
              />
            </div>
          </div>

          <div
            className={`flex items-start justify-center transition-all duration-500 ease-in-out ${
              showPositions ? 'w-0 opacity-0 pointer-events-none' : 'w-12 opacity-100'
            }`}
          >
            <button
              onClick={() => setShowPositions(true)}
              className="flex min-h-[600px] flex-col items-center justify-center gap-2 px-2 py-3 rounded-l-lg border border-slate-900 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition"
            >
              <span className="text-xs uppercase tracking-wide opacity-70">Positions</span>
              <span className="text-lg">←</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}