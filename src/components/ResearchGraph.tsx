import { useEffect, useRef } from 'react'
import { Chart } from 'chart.js/auto'
import type { TooltipItem } from 'chart.js'
import { useMarketHistory } from '../hooks/useMarketHistory'
import type { HistoryPreset } from '../hooks/useMarketHistory'
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

export default function ResearchGraph({ symbol, preset }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const chartRef = useRef<Chart<'line', number[], string> | null>(null)

  const data = useMarketHistory(symbol, preset)
  const precision = usePrecisionStore((state) => state.precision)

  useEffect(() => {
    if (!data) return

    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return

    const tooltipLabel = (context: TooltipItem<'line'>) => {
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

    chartRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.labels,
        datasets: [
          {
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
              label: tooltipLabel
            }
          }
        },
        animation: {
          duration: 250
        },
        scales: {
          x: {
            ticks: { maxTicksLimit: 8 }
          },
          y: {
            display: true,
            ticks: {
              callback: tickLabel
            }
          }
        }
      }
    })
  }, [data, precision, symbol])

  useEffect(() => {
    return () => {
      chartRef.current?.destroy()
      chartRef.current = null
    }
  }, [])

  if (!data) {
    return (
      <div className="h-[300px] flex items-center justify-center text-gray-400">
        Loading chart...
      </div>
    )
  }

  return <canvas ref={canvasRef} className="w-full h-[300px]" />
}
