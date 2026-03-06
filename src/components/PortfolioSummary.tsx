import { useEffect, useState } from 'react'
import { getPortfolioSummary } from '../api/portfolioSummary.api'
import type { PortfolioSummary } from '../interfaces/portfolioSummary.interface'
import { useWsPrices } from '../state/useWsPrices'

interface Props {
  refreshKey?: number
}

export default function PortfolioSummary({ refreshKey }: Props) {
  const [summary, setSummary] = useState<PortfolioSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const ws = useWsPrices()

  // initial load
  useEffect(() => {
    load()
  }, [])

  // refresh when a trade triggers refreshKey
  useEffect(() => {
    if (refreshKey !== undefined) {
      load()
    }
  }, [refreshKey])

  // refresh when websocket prices update
  useEffect(() => {
    if (ws?.prices) {
      load()
    }
  }, [ws?.prices])

  async function load() {
    try {
      const data = await getPortfolioSummary()
      setSummary(data)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>Loading overview...</div>
  if (!summary) return <div>No portfolio data</div>

  const pnlColor = (v: number) => (v >= 0 ? 'text-emerald-400' : 'text-rose-400')

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur shadow-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm uppercase tracking-wide text-slate-400">Portfolio Overview</h2>
        <span className="text-xs text-slate-500">
          Updated {new Date(summary.updatedAt).toLocaleTimeString()}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
          <div className="text-xs text-slate-400">Total Value</div>
          <div className="text-lg font-semibold text-white">
            ${(summary.totalValue ?? 0).toFixed(2)}
          </div>
        </div>

        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
          <div className="text-xs text-slate-400">Cash Balance</div>
          <div className="text-lg font-semibold text-white">
            ${(summary.cashBalance ?? 0).toFixed(2)}
          </div>
        </div>

        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
          <div className="text-xs text-slate-400">Positions Value</div>
          <div className="text-lg font-semibold text-white">
            ${(summary.positionsValue ?? 0).toFixed(2)}
          </div>
        </div>

        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
          <div className="text-xs text-slate-400">Unrealized PnL</div>
          <div className={`text-lg font-semibold ${pnlColor(summary.unrealizedPnl ?? 0)}`}>
            ${(summary.unrealizedPnl ?? 0).toFixed(2)}
          </div>
        </div>

        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
          <div className="text-xs text-slate-400">Realized PnL</div>
          <div className={`text-lg font-semibold ${pnlColor(summary.realizedPnl ?? 0)}`}>
            ${(summary.realizedPnl ?? 0).toFixed(2)}
          </div>
        </div>

        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
          <div className="text-xs text-slate-400">Net PnL</div>
          <div className={`text-lg font-semibold ${pnlColor(summary.netPnl ?? 0)}`}>
            ${(summary.netPnl ?? 0).toFixed(2)}
          </div>
        </div>

        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
          <div className="text-xs text-slate-400">Total Return</div>
          <div className={`text-lg font-semibold ${pnlColor(summary.totalReturnPct ?? 0)}`}>
            {((summary.totalReturnPct ?? 0) * 100).toFixed(2)}%
          </div>
        </div>

        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
          <div className="text-xs text-slate-400">Total Invested</div>
          <div className="text-lg font-semibold text-white">
            ${(summary.totalInvested ?? 0).toFixed(2)}
          </div>
        </div>

        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
          <div className="text-xs text-slate-400">Total Sold</div>
          <div className="text-lg font-semibold text-white">
            ${(summary.totalSold ?? 0).toFixed(2)}
          </div>
        </div>

      </div>
    </div>
  )
}