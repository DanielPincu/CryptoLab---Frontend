import { useEffect, useRef, useState } from 'react'
import { Chart } from 'chart.js/auto'
import type { ScriptableContext, TooltipItem } from 'chart.js'
import { useMarketHistory } from '../hooks/useMarketHistory'
import type { HistoryPreset, MarketCandle } from '../hooks/useMarketHistory'
import { usePrecisionStore } from '../state/usePrecisionStore'
import type { DisplayPrecision } from '../state/usePrecisionStore'
import { fixed8 } from '../utils/numberFormat'

interface Props {
  symbol: string
  preset: HistoryPreset
}

type ResearchChartView = 'graph' | 'pips' | 'candles'

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

function createLineFillGradient(context: ScriptableContext<'line'>) {
  const { chart } = context
  const { chartArea, ctx } = chart

  if (!chartArea) {
    return 'rgba(16,185,129,0.18)'
  }

  const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom)
  gradient.addColorStop(0, 'rgba(16,185,129,0.35)')
  gradient.addColorStop(0.55, 'rgba(16,185,129,0.12)')
  gradient.addColorStop(1, 'rgba(16,185,129,0.02)')

  return gradient
}

function drawCandlestickChart(
  canvas: HTMLCanvasElement,
  candles: MarketCandle[],
  precision: DisplayPrecision,
  progress = 1
) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const dpr = window.devicePixelRatio || 1
  const rect = canvas.getBoundingClientRect()
  const width = Math.max(rect.width, 320)
  const height = Math.max(rect.height, 300)

  canvas.width = width * dpr
  canvas.height = height * dpr
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, width, height)

  if (candles.length === 0) return

  const latest = candles[candles.length - 1]
  const latestLabel = formatPrice(latest.close, precision)
  ctx.font = '11px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace'

  const labelWidth = Math.ceil(ctx.measureText(latestLabel).width) + 18
  const rightPadding = Math.max(76, labelWidth + 18)
  const padding = { top: 18, right: rightPadding, bottom: 34, left: 12 }
  const chartWidth = width - padding.left - padding.right
  const chartHeight = height - padding.top - padding.bottom
  const minPrice = Math.min(...candles.map((candle) => candle.low))
  const maxPrice = Math.max(...candles.map((candle) => candle.high))
  const priceRange = maxPrice - minPrice || Math.max(Math.abs(maxPrice), 1)
  const paddedMin = minPrice - priceRange * 0.08
  const paddedMax = maxPrice + priceRange * 0.08
  const paddedRange = paddedMax - paddedMin || 1
  const candleSlot = chartWidth / candles.length
  const bodyWidth = Math.max(3, Math.min(14, candleSlot * 0.62))

  function yForPrice(price: number) {
    return padding.top + ((paddedMax - price) / paddedRange) * chartHeight
  }

  ctx.textBaseline = 'middle'

  for (let i = 0; i <= 5; i += 1) {
    const ratio = i / 5
    const y = padding.top + ratio * chartHeight
    const price = paddedMax - ratio * paddedRange

    ctx.strokeStyle = 'rgba(51,65,85,0.55)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(padding.left, y)
    ctx.lineTo(width - padding.right, y)
    ctx.stroke()

    ctx.fillStyle = '#94a3b8'
    ctx.textAlign = 'left'
    ctx.fillText(formatAxisPrice(price), width - padding.right + 10, y)
  }

  ctx.globalAlpha = progress

  candles.forEach((candle, index) => {
    const centerX = padding.left + candleSlot * index + candleSlot / 2
    const openY = yForPrice(candle.open)
    const closeY = yForPrice(candle.close)
    const highY = yForPrice(candle.high)
    const lowY = yForPrice(candle.low)
    const isUp = candle.close >= candle.open
    const color = isUp ? '#10b981' : '#f43f5e'
    const candleCenterY = (openY + closeY) / 2
    const animatedHighY = candleCenterY + (highY - candleCenterY) * progress
    const animatedLowY = candleCenterY + (lowY - candleCenterY) * progress
    const bodyHeight = Math.max(Math.abs(closeY - openY) * progress, 2)
    const top = candleCenterY - bodyHeight / 2

    ctx.strokeStyle = color
    ctx.lineWidth = 1.4
    ctx.beginPath()
    ctx.moveTo(centerX, animatedHighY)
    ctx.lineTo(centerX, animatedLowY)
    ctx.stroke()

    ctx.fillStyle = isUp ? 'rgba(16,185,129,0.82)' : 'rgba(244,63,94,0.82)'
    ctx.strokeStyle = color
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.roundRect(centerX - bodyWidth / 2, top, bodyWidth, bodyHeight, 2)
    ctx.fill()
    ctx.stroke()
  })

  ctx.globalAlpha = 1

  const labelIndexes = [0, Math.floor((candles.length - 1) / 2), candles.length - 1]
  ctx.fillStyle = '#64748b'
  ctx.textBaseline = 'top'

  labelIndexes.forEach((index) => {
    const candle = candles[index]
    const x = padding.left + candleSlot * index + candleSlot / 2

    ctx.textAlign = index === 0 ? 'left' : index === candles.length - 1 ? 'right' : 'center'
    ctx.fillText(
      new Date(candle.time).toLocaleDateString([], { month: 'short', day: 'numeric' }),
      x,
      height - padding.bottom + 12
    )
  })

  const latestY = yForPrice(latest.close)
  const labelX = width - padding.right + 6
  const labelCenterX = labelX + labelWidth / 2

  ctx.globalAlpha = progress
  ctx.strokeStyle = 'rgba(16,185,129,0.45)'
  ctx.setLineDash([4, 4])
  ctx.beginPath()
  ctx.moveTo(padding.left, latestY)
  ctx.lineTo(width - padding.right, latestY)
  ctx.stroke()
  ctx.setLineDash([])

  ctx.fillStyle = '#10b981'
  ctx.fillRect(labelX, latestY - 10, labelWidth, 20)
  ctx.fillStyle = '#052e16'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(latestLabel, labelCenterX, latestY)
  ctx.globalAlpha = 1
}

export default function ResearchGraph({ symbol, preset }: Props) {
  const [view, setView] = useState<ResearchChartView>('graph')
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

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    if (view === 'candles') {
      chartRef.current?.destroy()
      chartRef.current = null
      let animationFrame = 0
      let startTime: number | null = null
      const duration = 260
      const easeOutCubic = (value: number) => 1 - Math.pow(1 - value, 3)

      const draw = () => {
        if (canvasRef.current) {
          drawCandlestickChart(canvasRef.current, data.candles, precision)
        }
      }
      const animate = (time: number) => {
        startTime ??= time

        const elapsed = time - startTime
        const progress = easeOutCubic(Math.min(elapsed / duration, 1))

        if (canvasRef.current) {
          drawCandlestickChart(canvasRef.current, data.candles, precision, progress)
        }

        if (progress < 1) {
          animationFrame = window.requestAnimationFrame(animate)
        }
      }

      animationFrame = window.requestAnimationFrame(animate)
      window.addEventListener('resize', draw)

      return () => {
        window.cancelAnimationFrame(animationFrame)
        window.removeEventListener('resize', draw)
      }
    }

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

    canvas.removeAttribute('width')
    canvas.removeAttribute('height')
    ctx.setTransform(1, 0, 0, 1, 0, 0)

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
                backgroundColor: createLineFillGradient,
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

        <div className="grid grid-cols-3 rounded-md border border-slate-800 bg-slate-900 p-1 text-sm">
          {([
            ['graph', 'Graph'],
            ['pips', 'Pips'],
            ['candles', 'Candles']
          ] as Array<[ResearchChartView, string]>).map(([nextView, label]) => (
            <button
              key={nextView}
              type="button"
              onClick={() => setView(nextView)}
              className={`rounded px-3 py-1.5 transition ${
                view === nextView
                  ? 'bg-emerald-500/15 text-emerald-300'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1">
        <canvas ref={canvasRef} className="h-full min-h-[300px] w-full" />
      </div>
    </div>
  )
}
