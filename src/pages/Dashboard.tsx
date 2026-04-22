import { useEffect, useState } from 'react'
import TradePanel from '../components/TradePanel'
import LivePrices from '../components/LivePrices'
import Positions from '../components/Positions'
import PortfolioSummary from '../components/PortfolioSummary'
import { loadAccountIntoStore } from '../state/storeLoaders'
import { useAccountStore } from '../state/useAccountStore'
import { useWsPrices } from '../state/useWsPrices'


export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null)
  const [positionsRefreshKey, setPositionsRefreshKey] = useState(0)
  const [showSummary, setShowSummary] = useState<boolean>(() => {
    const saved = localStorage.getItem('dashboard.showSummary')
    return saved ? JSON.parse(saved) : true
  })

  const [showPositions, setShowPositions] = useState<boolean>(() => {
    const saved = localStorage.getItem('dashboard.showPositions')
    return saved ? JSON.parse(saved) : true
  })

  const ws = useWsPrices()
  const accountCash = useAccountStore((state) => state.account?.cashBalance ?? 0)

  const selectedPrice = selectedSymbol
    ? ws.prices?.[selectedSymbol]?.price
    : undefined

  // Load account
  useEffect(() => {
    loadAccountIntoStore()
      .catch(() => setError('Failed to load data'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    localStorage.setItem('dashboard.showSummary', JSON.stringify(showSummary))
  }, [showSummary])

  useEffect(() => {
    localStorage.setItem('dashboard.showPositions', JSON.stringify(showPositions))
  }, [showPositions])

  if (loading) return <div className="p-6 text-slate-400">Loading market…</div>
  if (error) return <div className="p-6 text-rose-400">{error}</div>

  return (
    <div className="p-6 mx-auto space-y-6 [scrollbar-gutter:stable]">

      {/* Portfolio Summary */}
      <div className="w-full">
        <button
          onClick={() => setShowSummary((s) => !s)}
          className="w-full flex items-center justify-between px-4 py-2 rounded-lg border border-slate-800 bg-slate-700 hover:bg-slate-800 transition group"
        >
          <div className="flex items-center gap-3 text-sm font-semibold text-slate-300 uppercase tracking-wide">
            <div className="flex items-center justify-center h-6 w-6 rounded-md border border-slate-700 bg-slate-800 text-slate-300 text-sm font-bold leading-none group-hover:bg-slate-700 transition">
              {showSummary ? '−' : '+'}
            </div>
            <span>Portfolio Summary</span>
          </div>
        </button>

        <div
          className={`mt-2 transition-all duration-300 ease-in-out overflow-hidden transform ${
            showSummary
              ? 'max-h-[600px] opacity-100 translate-x-0'
              : 'max-h-0 opacity-0 -translate-x-24'
          }`}
        >
          <PortfolioSummary />
        </div>
      </div>

      <div className={`grid grid-cols-1 md:items-start ${showPositions ? 'md:grid-cols-[2fr_1fr_1fr]' : 'md:grid-cols-[2fr_1fr_48px]'} gap-6`}>
        {/* Column 1: Live Prices */}
        <div className='rounded-lg border border-slate-800 bg-slate-950 p-3'>
        <LivePrices
          selectedSymbol={selectedSymbol}
          onSelect={(symbol) => {
            setSelectedSymbol(symbol)
          }}
        />
        </div>

        {/* Column 2: Trade Panel */}
        <div className="w-full relative">
          <div className="mb-4 p-3 rounded-lg bg-slate-900 border border-slate-800">
            <div className="text-xs text-slate-400">Buying Power</div>
            <div className="text-lg font-semibold text-emerald-400">
              ${accountCash.toFixed(2)}
            </div>
          </div>

          <div className='rounded-lg border border-slate-800 bg-slate-950 p-3'>
            <TradePanel
            symbol={selectedSymbol ?? undefined}
            currentPrice={selectedPrice}
            onSuccess={() => {
              void loadAccountIntoStore()
              setPositionsRefreshKey((k) => k + 1)
            }}
          />
          </div>
        </div>

        {/* Column 3: Positions Drawer / Handle */}
        <div className="relative flex items-start">
          <div
            className={`${showPositions ? 'w-full' : 'w-0'} overflow-hidden transform transition-all duration-300 ease-in-out ${
              showPositions ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0 pointer-events-none'
            }`}
          >
            <button
              onClick={() => setShowPositions(false)}
              className="mb-2 flex items-center justify-between px-4 py-2 rounded-lg border border-slate-800 bg-slate-700 hover:bg-slate-800 transition"
            >
              <span className="text-sm font-semibold text-slate-300 uppercase">Positions </span>
              <span className="text-slate-400">→</span>
            </button>

            <div className="max-h-[70vh] overflow-y-auto pr-2">
              <Positions
                selectedSymbol={selectedSymbol}
                onSelect={(symbol) => {
                  setSelectedSymbol(symbol)
                }}
                refreshKey={positionsRefreshKey}
              />
            </div>
          </div>

          {!showPositions && (
            <div className="hidden md:flex items-start justify-center w-12">
              <button
                onClick={() => setShowPositions(true)}
                className="flex min-h-[670px] flex-col items-center justify-center gap-2 px-2 py-3 rounded-l-lg border border-slate-900 bg-slate-700 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
              >
                <span className="text-xs uppercase tracking-wide opacity-70">Positions</span>
                <span className="text-lg">←</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
