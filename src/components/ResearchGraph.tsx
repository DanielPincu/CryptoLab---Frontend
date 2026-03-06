import { useEffect, useRef } from 'react'
import { Chart } from 'chart.js/auto'
import { apiMarketHistory } from '../api/market.api'

type HistoryPreset = 'day' | 'week' | 'month' | '6m' | 'year'

const PRESETS: Record<HistoryPreset, { interval: string; limit: number; label: string }> = {
  day: { interval: '1h', limit: 24, label: 'Last day' },
  week: { interval: '1d', limit: 7, label: 'Last week' },
  month: { interval: '1d', limit: 30, label: 'Last month' },
  '6m': { interval: '1w', limit: 26, label: 'Last 6 months' },
  year: { interval: '1w', limit: 52, label: 'Last year' }
}

interface Props {
  symbol: string
  preset: HistoryPreset
}

export default function ResearchGraph({ symbol, preset }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const chartRef = useRef<Chart | null>(null)

  useEffect(() => {
    async function load() {
      const cfg = PRESETS[preset]

      try {
        const res = await apiMarketHistory(symbol, cfg.interval, cfg.limit)

        const labels = res.candles.map((c) =>
          new Date(c.time).toLocaleDateString()
        )

        const closes = res.candles.map((c) => c.close)

        const ctx = canvasRef.current?.getContext('2d')
        if (!ctx) return

        if (chartRef.current) {
          // Update existing chart instead of recreating it
          chartRef.current.data.labels = labels
          chartRef.current.data.datasets[0].data = closes
          chartRef.current.data.datasets[0].label = `${symbol} (${cfg.label})`
          chartRef.current.update()
          return
        }

        chartRef.current = new Chart(ctx, {
          type: 'line',
          data: {
            labels,
            datasets: [
              {
                label: `${symbol} (${cfg.label})`,
                data: closes,
                tension: 0.25,
                borderColor: '#10b981',
                backgroundColor: (() => {
                  const gradient = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height)
                  gradient.addColorStop(0, 'rgba(16,185,129,0.35)')
                  gradient.addColorStop(1, 'rgba(16,185,129,0.02)')
                  return gradient
                })(),
                fill: true,
                pointRadius: 0,
                borderWidth: 2
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
              mode: 'index',
              intersect: false
            },
            plugins: {
              legend: { display: true }
            },
            animation: {
              duration: 250
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
      } catch {
        // ignore chart load errors
      }
    }

    load()

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy()
        chartRef.current = null
      }
    }
  }, [symbol, preset])

  return <canvas ref={canvasRef} className="w-full h-full"></canvas>
}