import { Link } from 'react-router-dom'
import { useSession } from '../auth/Session'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

import LuckyStrikeCard from '../components/LuckyStrikeCard'

export default function Home() {
  const { isAuthenticated, user, isLoading, logout } = useSession()
  const navigate = useNavigate()
  const [cookieDismissed, setCookieDismissed] = useState(() => !!localStorage.getItem('cookieNoticeSeen'))

  const shouldShowCookiePopup = isAuthenticated && !cookieDismissed

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

            <p className="text-xs text-slate-500 mb-4">
              Authentication uses HTTP-only cookies (JWT stored in cookie). No tokens are stored in localStorage.
            </p>

          {/* Lucky Strike Card */}
            <LuckyStrikeCard />

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
                onClick={async () => {
                  await logout()
                  navigate('/')
                }}
                className="flex-1 text-center px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/40 text-red-300 hover:bg-red-500/20 transition"
              >
                Logout
              </button>


            </div>
          </>
        )}
      </div>
      {shouldShowCookiePopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-xl py-6 max-w-sm w-full text-center shadow-xl">
            <h2 className="text-lg font-semibold mb-2">Cookies Notice</h2>
            <p className="text-sm text-slate-400 mb-4">
              This app uses HTTP-only cookies for authentication. <br /> No tokens are stored in localStorage.
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