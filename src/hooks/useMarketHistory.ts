import { useEffect, useState } from 'react'
import { apiMarketHistory } from '../api/market.api'

export type HistoryPreset = 'day' | 'week' | 'month' | '6m' | 'year'
export type MarketCandle = {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

const PRESETS: Record<HistoryPreset, { interval: string; limit: number }> = {
  day: { interval: '1h', limit: 24 },
  week: { interval: '1d', limit: 7 },
  month: { interval: '1d', limit: 30 },
  '6m': { interval: '1w', limit: 26 },
  year: { interval: '1w', limit: 52 }
}

export function useMarketHistory(symbol: string, preset: HistoryPreset) {
  const [data, setData] = useState<{
    labels: string[]
    closes: number[]
    candles: MarketCandle[]
  } | null>(null)

  useEffect(() => {
    let alive = true

    async function load() {
      try {
        const cfg = PRESETS[preset]
        const res = await apiMarketHistory(symbol, cfg.interval, cfg.limit)

        if (!alive) return

        setData({
          labels: res.candles.map(c =>
            preset === 'day'
              ? new Date(c.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : new Date(c.time).toLocaleDateString()
          ),
          closes: res.candles.map(c => c.close),
          candles: res.candles
        })
      } catch {
        if (alive) setData(null)
      }
    }

    load()

    return () => {
      alive = false
    }
  }, [symbol, preset])

  return data
}
