import { Link } from 'react-router-dom'
import { useSession } from '../auth/Session'
import { useNavigate } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'

import LuckyStrikeCard from '../components/LuckyStrikeCard'
import PortfolioSummary from '../components/PortfolioSummary'
import {
  loadAccountIntoStore,
  loadLatestPricesIntoStore,
  loadPositionsIntoStore
} from '../state/storeLoaders'
import { usePositionStore } from '../state/usePositionStore'
import { useWsPrices } from '../state/useWsPrices'

const featureCards = [
  {
    title: 'Paper trading',
    description: 'Practice crypto trades with simulated balances instead of real-money exposure.',
    accent: 'border-emerald-500/30 bg-emerald-500/5 text-emerald-300'
  },
  {
    title: 'Zero real risk',
    description: 'Test entries, exits, and portfolio decisions without risking your own capital.',
    accent: 'border-sky-500/30 bg-sky-500/5 text-sky-300'
  },
  {
    title: 'Real market context',
    description: 'Use live pricing and market history to make practice feel close to the real thing.',
    accent: 'border-violet-500/30 bg-violet-500/5 text-violet-300'
  }
]

const authedActions = [
  {
    to: '/dashboard',
    title: 'Dashboard',
    description: 'Trade, monitor prices, and review your portfolio.'
  },
  {
    to: '/research',
    title: 'Research',
    description: 'Analyze symbols and compare market history.'
  },
  {
    to: '/positions',
    title: 'Positions',
    description: 'Review open holdings and recent performance.'
  },
  {
    to: '/transactions',
    title: 'Transactions',
    description: 'Audit your trade history and account activity.'
  }
]

const portfolioHomeLinks = [
  {
    to: '/dashboard',
    label: 'Trade desk',
    value: 'Live market',
    accent: 'border-emerald-500/30 bg-emerald-500/5 text-emerald-300'
  },
  {
    to: '/positions',
    label: 'Holdings',
    value: 'Open positions',
    accent: 'border-violet-500/30 bg-violet-500/5 text-violet-300'
  },
  {
    to: '/transactions',
    label: 'History',
    value: 'Recent activity',
    accent: 'border-amber-500/30 bg-amber-500/5 text-amber-300'
  }
]

export default function Home() {
  const { isAuthenticated, user, isLoading, logout } = useSession()
  const navigate = useNavigate()
  const [cookieDismissed, setCookieDismissed] = useState(() => !!localStorage.getItem('cookieNoticeSeen'))
  const positions = usePositionStore((state) => state.positions)
  const positionSymbols = useMemo(
    () => [...new Set(positions.map((position) => position.symbol).filter(Boolean))],
    [positions]
  )
  const { status: priceStatus } = useWsPrices(isAuthenticated ? positionSymbols : [])

  const shouldShowCookiePopup = isAuthenticated && !cookieDismissed

  useEffect(() => {
    if (!isAuthenticated) return

    void Promise.all([
      loadAccountIntoStore(),
      loadPositionsIntoStore(),
      loadLatestPricesIntoStore()
    ])
  }, [isAuthenticated])

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-slate-400">Loading…</div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-72px)] overflow-hidden bg-slate-950">
      <section className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-14">
        <div className="flex min-h-[520px] flex-col justify-center">
          {isAuthenticated ? (
            <div className="w-full space-y-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-sky-300">
                    Portfolio Home
                  </div>
                  <h1 className="text-3xl font-bold tracking-normal text-slate-50 sm:text-4xl">
                    Welcome back{user?.username ? `, ${user.username}` : ''}
                  </h1>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
                    Your current account snapshot, performance, and next moves are ready.
                  </p>
                </div>

                <div className="w-fit min-w-28 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3">
                  <div className="text-xs uppercase tracking-wide text-slate-500">Live feed</div>
                  <div className="mt-1 text-sm font-semibold text-emerald-300">
                    {priceStatus === 'open' ? 'Streaming' : 'Syncing'}
                  </div>
                </div>
              </div>

              <PortfolioSummary />

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {portfolioHomeLinks.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`group rounded-lg border p-4 transition hover:border-slate-600 hover:bg-slate-900/80 ${item.accent}`}
                  >
                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {item.label}
                    </div>
                    <div className="mt-2 text-base font-semibold text-slate-100">
                      {item.value}
                    </div>
                    <div className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500 group-hover:text-slate-300">
                      Open
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <>
              <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-300">
                Zero-Risk Paper Trading
              </div>

              <h1 className="max-w-3xl text-4xl font-bold tracking-normal text-slate-50 sm:text-5xl lg:text-6xl">
                Practice crypto trading without risking real money.
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
                CryptoLab is a paper trading workspace where you can research markets, place simulated trades, and learn portfolio management with zero real-money risk.
              </p>
            </>
          )}

          {!isAuthenticated ? (
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/register"
                className="inline-flex min-h-11 items-center justify-center rounded-lg border border-emerald-400/50 bg-emerald-400 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-950/30 transition hover:bg-emerald-300"
              >
                Create account
              </Link>
              <Link
                to="/login"
                className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-700 bg-slate-900 px-5 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-slate-600 hover:bg-slate-800"
              >
                Sign in
              </Link>
            </div>
          ) : (
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/dashboard"
                className="inline-flex min-h-11 items-center justify-center rounded-lg border border-emerald-400/50 bg-emerald-400 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-950/30 transition hover:bg-emerald-300"
              >
                Open dashboard
              </Link>
              <button
                onClick={async () => {
                  await logout()
                  navigate('/')
                }}
                className="inline-flex min-h-11 items-center justify-center rounded-lg border border-rose-500/40 bg-rose-500/10 px-5 py-2.5 text-sm font-semibold text-rose-200 transition hover:bg-rose-500/20"
              >
                Logout
              </button>
            </div>
          )}

          {!isAuthenticated && (
            <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {featureCards.map((feature) => (
                <div
                  key={feature.title}
                  className={`rounded-lg border p-4 ${feature.accent}`}
                >
                  <div className="text-sm font-semibold text-slate-100">{feature.title}</div>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{feature.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="relative flex items-center lg:min-h-[640px]">
          <div className="absolute inset-0 rounded-[2rem] bg-[radial-gradient(circle_at_top_left,rgba(52,211,153,0.18),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(56,189,248,0.12),transparent_35%)]" />
          <div className="relative w-full rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-2xl shadow-slate-950/70 backdrop-blur sm:p-5">
            <div className="mb-5 flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <div className="text-sm text-slate-400">
                  {isAuthenticated ? 'Signed in as' : 'Paper trading overview'}
                </div>
                <div className="mt-1 text-2xl font-bold text-slate-50">
                  {isAuthenticated ? user?.username : 'CryptoLab'}
                </div>
              </div>
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-right">
                <div className="text-xs text-slate-400">Session</div>
                <div className="text-sm font-semibold text-emerald-300">
                  {isAuthenticated ? 'Active' : 'Ready'}
                </div>
              </div>
            </div>

            {isAuthenticated ? (
              <>
                <div className="mb-5 rounded-lg border border-slate-800 bg-slate-950/70 p-4">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Security</div>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    Authentication uses HTTP-only cookies.
                  </p>
                </div>

                <LuckyStrikeCard />

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {authedActions.map((action) => (
                    <Link
                      key={action.to}
                      to={action.to}
                      className="group rounded-lg border border-slate-800 bg-slate-950/70 p-4 transition hover:border-slate-700 hover:bg-slate-900"
                    >
                      <div className="text-sm font-semibold text-emerald-300">{action.title}</div>
                      <p className="mt-2 text-sm leading-6 text-slate-400">{action.description}</p>
                      <div className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500 group-hover:text-slate-300">
                        Open
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Practice account</div>
                      <div className="mt-2 text-lg font-semibold text-slate-100">Trade with simulated funds</div>
                    </div>
                    <div className="text-right font-mono text-sm text-emerald-300"></div>
                  </div>
                  <div className="mt-4 h-24 rounded-lg border border-slate-800 bg-slate-900 p-3">
                    <div className="flex h-full items-end gap-2">
                      {[45, 64, 52, 76, 58, 86, 72, 94, 81, 100, 88, 108].map((height, index) => (
                        <div
                          key={`${height}-${index}`}
                          className="flex-1 rounded-t bg-emerald-400/70"
                          style={{ height: `${height / 1.25}%` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-4">
                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Watchlist</div>
                    <div className="mt-2 text-2xl font-bold text-slate-50">Live prices</div>
                    <p className="mt-2 text-sm text-slate-400">Scan live market movement before placing practice trades.</p>
                  </div>
                  <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-4">
                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Risk</div>
                    <div className="mt-2 text-2xl font-bold text-slate-50">Zero capital</div>
                    <p className="mt-2 text-sm text-slate-400">Build confidence without exposing personal funds.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {shouldShowCookiePopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl border border-slate-700 bg-slate-900 p-6 text-center shadow-2xl">
            <h2 className="text-lg font-semibold mb-2">Cookies Notice</h2>
            <p className="text-sm text-slate-400 mb-4">
              This app uses HTTP-only cookies for authentication. <br /> 
            </p>
            <button
              onClick={() => {
                localStorage.setItem('cookieNoticeSeen', 'true')
                setCookieDismissed(true)
              }}
              className="px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/20 transition"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
