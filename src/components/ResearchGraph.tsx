import { useEffect, useRef } from 'react'
import { Chart } from 'chart.js/auto'
import { useMarketHistory } from '../hooks/useMarketHistory'
import type { HistoryPreset } from '../hooks/useMarketHistory'

interface Props {
  symbol: string
  preset: HistoryPreset
}

export default function ResearchGraph({ symbol, preset }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const chartRef = useRef<Chart | null>(null)

  const data = useMarketHistory(symbol, preset)

  useEffect(() => {
    if (!data) return

    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return

    if (chartRef.current) {
      chartRef.current.data.labels = data.labels
      chartRef.current.data.datasets[0].data = data.closes
      chartRef.current.data.datasets[0].label = symbol
      chartRef.current.update()
      return
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
  }, [data, symbol])

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