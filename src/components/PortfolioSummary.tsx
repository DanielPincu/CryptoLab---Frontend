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

  return (
    <div className="portfolio-summary">
      <h2>Portfolio Overview</h2>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <span>Total Value</span>
          <strong>${(summary.totalValue ?? 0).toFixed(2)}</strong>
        </div>

        <div>
          <span>Cash</span>
          <strong>${(summary.cashBalance ?? 0).toFixed(2)}</strong>
        </div>

        <div>
          <span>Positions</span>
          <strong>${(summary.positionsValue ?? 0).toFixed(2)}</strong>
        </div>

        <div>
          <span>Unrealized PnL</span>
          <strong>${(summary.unrealizedPnl ?? 0).toFixed(2)}</strong>
        </div>

        <div>
          <span>Realized PnL</span>
          <strong>${(summary.realizedPnl ?? 0).toFixed(2)}</strong>
        </div>

        <div>
          <span>Total Return</span>
          <strong>{((summary.totalReturnPct ?? 0) * 100).toFixed(2)}%</strong>
        </div>

        <div>
          <span>Net PnL</span>
          <strong>${(summary.netPnl ?? 0).toFixed(2)}</strong>
        </div>

        <div>
          <span>Total Invested</span>
          <strong>${(summary.totalInvested ?? 0).toFixed(2)}</strong>
        </div>

        <div>
          <span>Total Sold</span>
          <strong>${(summary.totalSold ?? 0).toFixed(2)}</strong>
        </div>
      </div>

      <small>
        Updated: {new Date(summary.updatedAt).toLocaleTimeString()}
      </small>
    </div>
  )
}