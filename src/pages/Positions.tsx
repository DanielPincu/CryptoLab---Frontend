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
    <div className="p-6 mx-auto h-screen overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">

        {/* Column 1: Positions */}
        <div className="h-full overflow-y-auto pr-2">
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
          <div className="h-full">
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
