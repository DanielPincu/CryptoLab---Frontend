import { useEffect } from 'react'
import { useResearch } from '../hooks/useResearch'
import TradePanel from '../components/TradePanel'
import Positions from '../components/Positions'
import ResearchGraph from '../components/ResearchGraph'
import { useWsPrices } from '../state/useWsPrices'

export default function Research() {
  const {
    symbols,
    symbol, setSymbol,
    preset, setPreset,
    historyStatus,
    error,
    warning,
    quote,
    favLoading,
    showPositions, setShowPositions,
    positionsRefreshKey, setPositionsRefreshKey,
    isFavorite,
    handleAddFavorite,
    handleRemoveFavorite,
    presetButtons,
    loadQuote,
    loadAccount
  } = useResearch()
  const ws = useWsPrices(symbol ? [symbol] : [])
  const livePrice = symbol ? ws.prices?.[symbol]?.price : undefined
  const currentPrice = livePrice ?? quote?.price

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

  return (
    <div className="p-6 mx-auto overflow-x-hidden md:h-[calc(100vh-73px)] ">
      
      {error && (
        <div className="text-rose-400 mb-4 text-sm">{error}</div>
      )}

      {warning && (
        <div className="mb-4 rounded-md border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
          {warning}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-4 mb-4">
        <select
          value={symbol}
          onChange={(e) => {
            const v = e.target.value.toUpperCase().trim()
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
          <div className="text-xs text-slate-400">Quote</div>
          <div className="mt-1 font-semibold text-emerald-300">
            {currentPrice ? currentPrice.toFixed(4) : '—'}
          </div>
        </div>
        
      </div>

      <div className={`grid grid-cols-1 md:items-start ${showPositions ? 'md:grid-cols-[2fr_1fr_1fr]' : 'md:grid-cols-[2fr_1fr_48px]'} gap-6 md:h-[calc(100%-7.5rem)]`}>
        <div className="min-w-0 rounded-lg border border-slate-800 bg-slate-950 p-3 h-[585px]">
          <ResearchGraph
            key={`${symbol}-${preset}-${showPositions}`}
            symbol={symbol}
            preset={preset}
          />
        </div>

        <div className="min-w-0 rounded-lg border border-slate-800 bg-slate-950 p-3">
          <TradePanel
            symbol={symbol}
            currentPrice={currentPrice}
            onSuccess={() => {
              void loadQuote(symbol)
              void loadAccount()
              setPositionsRefreshKey((k) => k + 1)
            }}
          />
        </div>

        {/* Positions Drawer */}
        <div className="hidden relative md:flex items-start md:h-full">
          <div
            className={`overflow-hidden transform transition-transform duration-500 ease-in-out ${
              showPositions
                ? 'translate-x-0 opacity-100'
                : 'translate-x-full opacity-0 pointer-events-none'
            }`}
          >
            <button
              onClick={() => setShowPositions(false)}
              className="mb-2 flex items-center justify-between px-4 py-2 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 transition"
            >
              <span className="text-sm font-semibold text-slate-300 uppercase">Positions</span>
              <span className="text-slate-400">→</span>
            </button>

          <div className="w-96 md:h-full max-h-[70vh] overflow-y-auto">
              <Positions
                selectedSymbol={symbol}
                refreshKey={positionsRefreshKey}
                onSelect={(sym) => {
                  setSymbol(sym)
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
              className="flex min-h-[585px] flex-col items-center justify-center gap-2 px-2 py-3 rounded-l-lg border border-slate-900 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition"
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
