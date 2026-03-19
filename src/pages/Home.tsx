import { Link } from 'react-router-dom'
import { useSession } from '../auth/Session'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'

import { getPortfolioSummary } from '../api/portfolioSummary.api'

type LuckyStrike = {
  progressPercent: number
  remainingPercent: number
  targetPercent: number
  reward: number
  achieved: boolean
  startEquity: number
}

type PortfolioSummary = {
  luckyStrike?: LuckyStrike
}

export default function Home() {
  const { isAuthenticated, user, isLoading, logout } = useSession()
  const navigate = useNavigate()
  const [portfolio, setPortfolio] = useState<PortfolioSummary | null>(null)

  useEffect(() => {
    if (!isAuthenticated) return

    getPortfolioSummary()
      .then((data) => setPortfolio(data as PortfolioSummary))
      .catch(() => {})
  }, [isAuthenticated])

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-slate-400">Loading…</div>
      </div>
    )
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="max-w-2xl w-full p-8 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur shadow-xl">
        <h1 className="text-3xl font-bold mb-2">CryptoLab</h1>

        {!isAuthenticated ? (
          <>
            <p className="text-slate-300 mb-6">
              Track live crypto prices, manage your favorites, and explore market history in one place.
            </p>

            <div className="flex gap-3">
              <Link
                to="/login"
                className="px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/20 transition"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded-lg bg-sky-500/10 border border-sky-500/40 text-sky-300 hover:bg-sky-500/20 transition"
              >
                Create account
              </Link>
            </div>
          </>
        ) : (
          <>
            <p className="text-slate-300 mb-2">
              Welcome back, <span className="font-semibold text-emerald-300">{user?.username}</span> 👋
            </p>

            {portfolio?.luckyStrike && (
              <div className="mb-6 p-4 rounded-lg border border-emerald-500/30 bg-emerald-500/5">
                <div className="text-sm text-slate-400 mb-1">Lucky Strike Progress</div>

                <div className="text-lg font-semibold text-emerald-300">
                  {portfolio.luckyStrike.progressPercent}% / {portfolio.luckyStrike.targetPercent}%
                </div>

                <div className="text-xs text-slate-400 mb-2">
                  {portfolio.luckyStrike.remainingPercent > 0
                    ? `You need +${portfolio.luckyStrike.remainingPercent}% more to earn $${portfolio.luckyStrike.reward}`
                    : 'Reward ready! Sell to claim 🎯'}
                </div>

                <div className="text-xs text-slate-500 mb-2">
                  Start Balance: ${portfolio.luckyStrike.startEquity.toFixed(2)}
                </div>

                <div className={`text-xs font-medium mb-2 ${portfolio.luckyStrike.achieved ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {portfolio.luckyStrike.achieved ? 'Reward claimed ✅' : 'Reward not claimed'}
                </div>

                <div className="w-full h-2 bg-slate-800 rounded overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 transition-all"
                    style={{
                      width: `${Math.max(
                        0,
                        Math.min(
                          100,
                          (portfolio.luckyStrike.progressPercent / portfolio.luckyStrike.targetPercent) * 100
                        )
                      )}%`
                    }}
                  />
                </div>
              </div>
            )}

            <div className="flex gap-3 w-full">

              <Link
                to="/dashboard"
                className="flex-1 text-center px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/20 transition"
              >
                Dashboard
              </Link>

              <Link
                to="/transactions"
                className="flex-1 text-center px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/20 transition"
              >
                Transactions
              </Link>

              <Link
                to="/portfolio"
                className="flex-1 text-center px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/20 transition"
              >
                Portfolio
              </Link>

              <button
                onClick={() => {
                  logout()
                  navigate('/login')
                }}
                className="flex-1 text-center px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/40 text-red-300 hover:bg-red-500/20 transition"
              >
                Logout
              </button>


            </div>
          </>
        )}
      </div>
    </div>
  )
}