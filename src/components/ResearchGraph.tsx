import { useEffect, useRef, useState } from 'react'
import { Chart } from 'chart.js/auto'
import type { TooltipItem } from 'chart.js'
import { useMarketHistory } from '../hooks/useMarketHistory'
import type { HistoryPreset, MarketCandle } from '../hooks/useMarketHistory'
import { usePrecisionStore } from '../state/usePrecisionStore'
import type { DisplayPrecision } from '../state/usePrecisionStore'
import { fixed8 } from '../utils/numberFormat'

interface Props {
  symbol: string
  preset: HistoryPreset
}

function formatPrice(price: number, precision: DisplayPrecision) {
  return fixed8(price, precision)
}

function formatAxisPrice(price: number) {
  const absPrice = Math.abs(price)

  if (absPrice >= 1) {
    return price.toLocaleString('en-US', {
      maximumFractionDigits: 2
    })
  }

  if (absPrice >= 0.01) {
    return price.toLocaleString('en-US', {
      maximumFractionDigits: 4
    })
  }

  return price.toLocaleString('en-US', {
    maximumFractionDigits: 8
  })
}

function getPipValue(candle: MarketCandle) {
  return candle.close - candle.open
}

function getRangeValue(candle: MarketCandle) {
  return candle.high - candle.low
}

export default function ResearchGraph({ symbol, preset }: Props) {
  const [view, setView] = useState<'graph' | 'pips'>('graph')
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const chartRef = useRef<Chart<'line' | 'bar', number[], string> | null>(null)

  const data = useMarketHistory(symbol, preset)
  const precision = usePrecisionStore((state) => state.precision)

  useEffect(() => {
    if (!data) {
      chartRef.current?.destroy()
      chartRef.current = null
      return
    }

    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return

    const tooltipLabel = (context: TooltipItem<'line' | 'bar'>) => {
      const value = typeof context.parsed.y === 'number' ? context.parsed.y : Number(context.raw)

      return `${context.dataset.label}: ${Number.isFinite(value) ? formatPrice(value, precision) : context.formattedValue}`
    }
    const tickLabel = (value: string | number) => {
      const numericValue = Number(value)

      return Number.isFinite(numericValue) ? formatAxisPrice(numericValue) : String(value)
    }

    if (chartRef.current) {
      chartRef.current.destroy()
      chartRef.current = null
    }

    const pipValues = data.candles.map(getPipValue)
    const rangeValues = data.candles.map(getRangeValue)

    chartRef.current = new Chart(ctx, {
      type: view === 'graph' ? 'line' : 'bar',
      data: {
        labels: data.labels,
        datasets: [
          view === 'graph'
            ? {
                label: symbol,
                data: data.closes,
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
            : {
                label: 'Pips',
                data: pipValues,
                backgroundColor: pipValues.map((value) =>
                  value >= 0 ? 'rgba(16,185,129,0.75)' : 'rgba(244,63,94,0.75)'
                ),
                borderColor: pipValues.map((value) =>
                  value >= 0 ? '#10b981' : '#f43f5e'
                ),
                borderWidth: 1,
                borderRadius: 3,
                barPercentage: 0.85,
                categoryPercentage: 0.9
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
          legend: { display: true },
          tooltip: {
            callbacks: {
              label: tooltipLabel,
              afterLabel: (context) => {
                if (view === 'graph') return ''

                const range = rangeValues[context.dataIndex]
                return `Range: ${formatPrice(range, precision)}`
              }
            }
          }
        },
        animation: {
          duration: 250
        },
        scales: {
          x: {
            grid: {
              display: false
            },
            ticks: { maxTicksLimit: 8 }
          },
          y: {
            display: true,
            grid: {
              color: (context) => context.tick.value === 0 ? 'rgba(148,163,184,0.5)' : 'rgba(51,65,85,0.55)'
            },
            ticks: {
              callback: tickLabel
            }
          }
        }
      }
    })
  }, [data, precision, symbol, view])

  useEffect(() => {
    return () => {
      chartRef.current?.destroy()
      chartRef.current = null
    }
  }, [])

  if (!data) {
    return (
      <div className="flex h-full min-h-[300px] items-center justify-center text-gray-400">
        Loading chart...
      </div>
    )
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="font-mono text-sm font-semibold text-slate-200">{symbol}</div>
          <div className="text-xs text-slate-500">{data.candles.length} candles</div>
        </div>

        <div className="grid grid-cols-2 rounded-md border border-slate-800 bg-slate-900 p-1 text-sm">
          <button
            type="button"
            onClick={() => setView('graph')}
            className={`rounded px-3 py-1.5 transition ${
              view === 'graph'
                ? 'bg-emerald-500/15 text-emerald-300'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Graph
          </button>
          <button
            type="button"
            onClick={() => setView('pips')}
            className={`rounded px-3 py-1.5 transition ${
              view === 'pips'
                ? 'bg-emerald-500/15 text-emerald-300'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Pips
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1">
        <canvas ref={canvasRef} className="h-full min-h-[300px] w-full" />
      </div>
    </div>
  )
}
