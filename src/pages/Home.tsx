import { Link } from 'react-router-dom'
import { useSession } from '../auth/Session'
import { useNavigate } from 'react-router-dom'

import LuckyStrikeCard from '../components/LuckyStrikeCard'

export default function Home() {
  const { isAuthenticated, user, isLoading, logout } = useSession()
  const navigate = useNavigate()

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