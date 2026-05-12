import { useEffect, useMemo, useState } from 'react'
import { loadPortfolioSummaryIntoStore } from '../state/storeLoaders'
import { usePortfolioStore } from '../state/usePortfolioStore'
import { useAccountStore } from '../state/useAccountStore'
import { usePositionStore } from '../state/usePositionStore'
import { usePriceStore } from '../state/usePriceStore'
import { usePrecisionStore } from '../state/usePrecisionStore'
import { money8, percent8 } from '../utils/numberFormat'

interface Props {
  refreshKey?: number
}

export default function PortfolioSummary({ refreshKey }: Props) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const summary = usePortfolioStore((state) => state.summary)
  const cashBalance = useAccountStore((state) => state.account?.cashBalance ?? null)
  const positions = usePositionStore((state) => state.positions)
  const prices = usePriceStore((state) => state.prices)
  const precision = usePrecisionStore((state) => state.precision)

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

  async function load() {
    try {
      setError(null)
      await loadPortfolioSummaryIntoStore()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load portfolio summary')
    } finally {
      setLoading(false)
    }
  }

  const liveSummary = useMemo(() => {
    if (!summary) return null

    const nextCashBalance = cashBalance ?? summary.cashBalance ?? 0

    const livePositions = positions.map((position) => {
      const livePrice = prices[position.symbol]?.price ?? position.currentPrice ?? null
      const marketValue = livePrice == null ? position.marketValue ?? 0 : livePrice * position.qty
      const unrealizedPnl = marketValue - position.positionCost

      return {
        marketValue,
        unrealizedPnl
      }
    })

    const positionsValue = livePositions.reduce((total, position) => total + position.marketValue, 0)
    const unrealizedPnl = livePositions.reduce((total, position) => total + position.unrealizedPnl, 0)
    const totalValue = nextCashBalance + positionsValue
    const netPnl = (summary.realizedPnl ?? 0) + unrealizedPnl
    const totalReturnPct =
      summary.totalInvested > 0 ? netPnl / summary.totalInvested : 0

    return {
      ...summary,
      cashBalance: nextCashBalance,
      positionsValue,
      totalValue,
      unrealizedPnl,
      netPnl,
      totalReturnPct,
      updatedAt: new Date().toISOString()
    }
  }, [cashBalance, positions, prices, summary])

  if (loading) return <div>Loading overview...</div>
  if (error) return <div className="text-rose-400">{error}</div>
  if (!liveSummary) return <div>No portfolio data</div>

  const pnlColor = (v: number) => (v >= 0 ? 'text-emerald-400' : 'text-rose-400')

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur shadow-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm uppercase tracking-wide text-slate-400">Portfolio Overview</h2>
        <span className="text-xs text-slate-500">
          Updated {new Date(liveSummary.updatedAt).toLocaleTimeString()}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
          <div className="text-xs text-slate-400">Total Value</div>
          <div className="text-lg font-semibold text-white">
            {money8(liveSummary.totalValue ?? 0, precision)}
          </div>
        </div>

        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
          <div className="text-xs text-slate-400">Cash Balance</div>
          <div className="text-lg font-semibold text-white">
            {money8(liveSummary.cashBalance ?? 0, precision)}
          </div>
        </div>

        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
          <div className="text-xs text-slate-400">Positions Value</div>
          <div className="text-lg font-semibold text-white">
            {money8(liveSummary.positionsValue ?? 0, precision)}
          </div>
        </div>

        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
          <div className="text-xs text-slate-400">Unrealized PnL</div>
          <div className={`text-lg font-semibold ${pnlColor(liveSummary.unrealizedPnl ?? 0)}`}>
            {money8(liveSummary.unrealizedPnl ?? 0, precision)}
          </div>
        </div>

        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
          <div className="text-xs text-slate-400">Realized PnL</div>
          <div className={`text-lg font-semibold ${pnlColor(liveSummary.realizedPnl ?? 0)}`}>
            {money8(liveSummary.realizedPnl ?? 0, precision)}
          </div>
        </div>

        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
          <div className="text-xs text-slate-400">Net PnL</div>
          <div className={`text-lg font-semibold ${pnlColor(liveSummary.netPnl ?? 0)}`}>
            {money8(liveSummary.netPnl ?? 0, precision)}
          </div>
        </div>

        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
          <div className="text-xs text-slate-400">Total Return</div>
          <div className={`text-lg font-semibold ${pnlColor(liveSummary.totalReturnPct ?? 0)}`}>
            {percent8((liveSummary.totalReturnPct ?? 0) * 100, precision)}
          </div>
        </div>

        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
          <div className="text-xs text-slate-400">Total Invested</div>
          <div className="text-lg font-semibold text-white">
            {money8(liveSummary.totalInvested ?? 0, precision)}
          </div>
        </div>

        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
          <div className="text-xs text-slate-400">Total Sold</div>
          <div className="text-lg font-semibold text-white">
            {money8(liveSummary.totalSold ?? 0, precision)}
          </div>
        </div>

      </div>
    </div>
  )
}
