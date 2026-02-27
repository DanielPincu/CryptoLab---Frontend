import { useEffect, useState } from 'react'
import { apiAccountMe } from '../api/account.api'
import TradePanel from '../components/TradePanel'
import LivePrices from '../components/LivePrices'
import Positions from '../components/Positions'
import { useWsPrices } from '../state/useWsPrices'


export default function Dashboard() {
  const [accountCash, setAccountCash] = useState<number>(0)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null)
  const [selectedPositionQty, setSelectedPositionQty] = useState<number | undefined>(undefined)
  const [positionsRefreshKey, setPositionsRefreshKey] = useState(0)

  const ws = useWsPrices()

  const selectedPrice = selectedSymbol
    ? ws.prices?.[selectedSymbol]?.price
    : undefined

  // Load account
  useEffect(() => {
    apiAccountMe()
      .then((account) => {
        setAccountCash(account.cashBalance ?? 0)
      })
      .catch(() => setError('Failed to load data'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="p-6 text-slate-400">Loading market…</div>
  if (error) return <div className="p-6 text-rose-400">{error}</div>

  return (
    <div className="p-6 mx-auto grid grid-cols-[2fr_1fr_1fr] gap-6">
      {/* Column 1: Live Prices */}
      <LivePrices
        selectedSymbol={selectedSymbol}
        onSelect={(symbol) => {
          setSelectedSymbol(symbol)
          setSelectedPositionQty(undefined)
        }}
      />

      {/* Column 2: Trade Panel */}
      <div className="w-full">
        <div className="mb-4 p-3 rounded-lg bg-slate-900 border border-slate-800">
          <div className="text-xs text-slate-400">Buying Power</div>
          <div className="text-lg font-semibold text-emerald-400">
            ${accountCash.toFixed(2)}
          </div>
        </div>

        <TradePanel
          symbol={selectedSymbol ?? undefined}
          currentPrice={selectedPrice}
          availableCash={accountCash}
          positionQty={selectedPositionQty}
          onSuccess={() => {
            apiAccountMe().then((account) =>
              setAccountCash(account.cashBalance ?? 0)
            )
            setPositionsRefreshKey((k) => k + 1)
          }}
        />
      </div>

      {/* Column 3: Positions */}
      <div className="w-full max-h-[75vh] overflow-y-auto pr-2">
        <Positions
          selectedSymbol={selectedSymbol}
          onSelect={(symbol, qty) => {
            setSelectedSymbol(symbol)
            setSelectedPositionQty(qty)
          }}
          refreshKey={positionsRefreshKey}
        />
      </div>
    </div>
  )
}