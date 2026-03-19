import type { LuckyStrike } from '../interfaces/luckyStrike.interface'
import { useEffect, useState } from 'react'
import { getPortfolioSummary } from '../api/portfolioSummary.api'

export default function LuckyStrikeCard() {
  const [luckyStrike, setLuckyStrike] = useState<LuckyStrike | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getPortfolioSummary()
      .then((data) => {
        setLuckyStrike(data.luckyStrike ?? null)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading || !luckyStrike) {
    return (
      <div className="mb-6 p-4 rounded-lg border border-slate-800 bg-slate-900/60">
        <div className="animate-pulse">
          <div className="h-4 w-40 bg-slate-700 rounded mb-3" />
          <div className="h-6 w-56 bg-slate-700 rounded mb-3" />
          <div className="h-3 w-72 bg-slate-700 rounded mb-3" />
          <div className="h-3 w-48 bg-slate-700 rounded mb-3" />
          <div className="h-2 w-full bg-slate-700 rounded" />
        </div>
      </div>
    )
  }
  const progressWidth = Math.max(
    0,
    Math.min(
      100,
      (luckyStrike.progressPercent / luckyStrike.targetPercent) * 100
    )
  )

  return (
    <div className="mb-6 p-4 rounded-lg border border-emerald-500/30 bg-emerald-500/5">
      <div className="text-sm text-slate-400 mb-1">
        Lucky Strike Progress
      </div>

      <div className="text-lg font-semibold text-emerald-300">
        {luckyStrike.progressPercent}% / {luckyStrike.targetPercent}%
      </div>

      <div className="text-xs text-slate-400 mb-2">
        {luckyStrike.achieved
          ? 'Reward already claimed today ✅'
          : luckyStrike.remainingPercent > 0
          ? `You need +${luckyStrike.remainingPercent}% more to earn $${luckyStrike.reward}`
          : 'Reward ready! Sell to claim 🎯'}
      </div>

      <div className="text-xs text-slate-500 mb-2">
        Start Balance: ${luckyStrike.startEquity.toFixed(2)}
      </div>

      <div
        className={`text-xs font-medium mb-2 ${
          luckyStrike.achieved
            ? 'text-emerald-400'
            : 'text-slate-500'
        }`}
      >
        {luckyStrike.achieved
          ? 'Reward claimed ✅'
          : 'Reward not claimed'}
      </div>

      <div className="w-full h-2 bg-slate-800 rounded overflow-hidden">
        <div
          className="h-full bg-emerald-400 transition-all"
          style={{ width: `${progressWidth}%` }}
        />
      </div>
    </div>
  )
}