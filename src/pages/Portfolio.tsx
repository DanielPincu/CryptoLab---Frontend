import { useState, useEffect } from 'react'
import Positions from '../components/Positions'
import TradePanel from '../components/TradePanel'
import { useWsPrices } from '../state/useWsPrices'
import { apiAccountMe } from '../api/account.api'

export default function Portfolio() {
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null)
  const [selectedPositionQty, setSelectedPositionQty] = useState<number | undefined>(undefined)
  const [accountCash, setAccountCash] = useState<number>(0)
  const [positionsRefreshKey, setPositionsRefreshKey] = useState(0)
  const [positionsCount, setPositionsCount] = useState(0)

  const ws = useWsPrices()

  const selectedPrice = selectedSymbol
    ? ws.prices?.[selectedSymbol]?.price
    : undefined

  useEffect(() => {
    apiAccountMe().then((account) =>
      setAccountCash(account.cashBalance ?? 0)
    )
  }, [])

  return (
    <div className="p-6 max-w-6xl mx-auto flex gap-6">
      
      {/* Left: Positions */}
      <div className="flex-1">
        <Positions
          selectedSymbol={selectedSymbol}
          onSelect={(symbol, qty) => {
            setSelectedSymbol(symbol)
            setSelectedPositionQty(qty)
          }}
          refreshKey={positionsRefreshKey}
          onCountChange={setPositionsCount}
        />
      </div>

      {positionsCount > 0 && (
        <div className="w-96 shrink-0">
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
      )}
    </div>
  )
}