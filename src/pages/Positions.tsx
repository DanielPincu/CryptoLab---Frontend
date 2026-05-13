import { useState, useEffect } from 'react'
import Positions from '../components/Positions'
import TradePanel from '../components/TradePanel'
import { useWsPrices } from '../state/useWsPrices'
import { loadAccountIntoStore } from '../state/storeLoaders'

export default function Portfolio() {
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null)
  const [positionsRefreshKey, setPositionsRefreshKey] = useState(0)
  const [positionsCount, setPositionsCount] = useState(0)

  const ws = useWsPrices()

  const selectedPrice = selectedSymbol
    ? ws.prices?.[selectedSymbol]?.price
    : undefined

  useEffect(() => {
    void loadAccountIntoStore()
  }, [])

  return (
    <div className="p-6 mx-auto bg-black">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:h-screen">

        {/* Column 1: Positions */}
        <div className="rounded-lg p-3 lg:overflow-y-auto">
          <Positions
            selectedSymbol={selectedSymbol}
            onSelect={(symbol) => {
              setSelectedSymbol(symbol)
            }}
            refreshKey={positionsRefreshKey}
            onCountChange={setPositionsCount}
          />
        </div>

        {/* Column 2: Trade */}
        {positionsCount > 0 && (
          <div className="p-3 rounded-lg lg:sticky lg:top-32 lg:self-start">
            <TradePanel
              symbol={selectedSymbol ?? undefined}
              currentPrice={selectedPrice}
              onSuccess={() => {
                void loadAccountIntoStore()
                setPositionsRefreshKey((k) => k + 1)
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
