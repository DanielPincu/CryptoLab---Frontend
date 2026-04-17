import { useEffect, useState } from 'react'
import { apiMarketHistory } from '../api/market.api'

export type HistoryPreset = 'day' | 'week' | 'month' | '6m' | 'year'

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
            new Date(c.time).toLocaleDateString()
          ),
          closes: res.candles.map(c => c.close)
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