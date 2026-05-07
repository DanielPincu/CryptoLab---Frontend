import { useEffect, useMemo, useRef, useState } from 'react'
import type {
  IMarketTickerMove,
  IMarketTickerProps,
  IUseMarketTickerResult
} from '../interfaces/marketTicker.interface'
import { useWsPrices } from '../state/useWsPrices'

const FAVORITE_ORDER = [
  'BTCUSDT',
  'ETHUSDT',
  'SOLUSDT',
  'BNBUSDT',
  'XRPUSDT',
  'ADAUSDT',
  'DOGEUSDT',
  'AVAXUSDT',
  'LINKUSDT',
  'LTCUSDT'
]

const priceFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 5,
  maximumFractionDigits: 5
})

function normalizeSymbol(symbol: string) {
  return symbol.toUpperCase().trim()
}

function displaySymbol(symbol: string) {
  return symbol.replace(/(USDT|USD)$/i, '')
}

function formatPrice(price: number) {
  return priceFormatter.format(price)
}

export function useMarketTicker({
  maxItems = 48,
  symbols
}: Pick<IMarketTickerProps, 'maxItems' | 'symbols'> = {}): IUseMarketTickerResult {
  const { status, prices } = useWsPrices(symbols)
  const initialPricesRef = useRef<Record<string, number>>({})
  const [moves, setMoves] = useState<Record<string, IMarketTickerMove>>({})

  const rows = useMemo(() => {
    const allowedSymbols = symbols?.map(normalizeSymbol)
    const allowedSet = allowedSymbols ? new Set(allowedSymbols) : null
    const orderIndex = new Map(FAVORITE_ORDER.map((symbol, index) => [symbol, index]))

    return Object.values(prices)
      .filter((tick) => {
        return tick?.symbol && typeof tick.price === 'number' && (!allowedSet || allowedSet.has(tick.symbol))
      })
      .sort((a, b) => {
        const aOrder = orderIndex.get(a.symbol) ?? Number.MAX_SAFE_INTEGER
        const bOrder = orderIndex.get(b.symbol) ?? Number.MAX_SAFE_INTEGER

        if (aOrder !== bOrder) return aOrder - bOrder
        return a.symbol.localeCompare(b.symbol)
      })
      .slice(0, maxItems)
      .map((tick) => {
        const move = moves[tick.symbol] ?? { direction: 'flat' as const, percent: 0 }

        return {
          symbol: tick.symbol,
          displaySymbol: displaySymbol(tick.symbol),
          price: tick.price,
          priceLabel: formatPrice(tick.price),
          percentLabel: `${Math.abs(move.percent).toFixed(5)}%`,
          move
        }
      })
  }, [maxItems, moves, prices, symbols])

  useEffect(() => {
    const nextMoves: Record<string, IMarketTickerMove> = {}
    let changed = false

    Object.values(prices).forEach((tick) => {
      if (!tick?.symbol || typeof tick.price !== 'number') return

      if (initialPricesRef.current[tick.symbol] === undefined) {
        initialPricesRef.current[tick.symbol] = tick.price
        return
      }

      const initialPrice = initialPricesRef.current[tick.symbol]

      if (!initialPrice || initialPrice === tick.price) return

      const percent = ((tick.price - initialPrice) / initialPrice) * 100

      nextMoves[tick.symbol] = {
        direction: percent > 0 ? 'up' : percent < 0 ? 'down' : 'flat',
        percent
      }

      changed = true
    })

    if (changed) {
      setMoves((current) => ({ ...current, ...nextMoves }))
    }
  }, [prices])

  return {
    rows,
    status,
    duration: Math.max(22, Math.min(90, rows.length * 2.6))
  }
}
