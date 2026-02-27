import { Link } from 'react-router-dom'
import { useSession } from '../auth/Session'

export default function Home() {
  const { isAuthenticated, user, isLoading } = useSession()

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
            <p className="text-slate-400 mb-6">
              You are logged in and ready to explore the markets.
            </p>

            <div className="flex gap-3">
              <Link
                to="/dashboard"
                className="px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/20 transition"
              >
                Dashboard
              </Link>
              <Link
                to="/profile"
                className="px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700 transition"
              >
                View Profile
              </Link>
            </div>
          </>
        )}

        <div className="mt-8 text-sm text-slate-400">
          Live prices via WebSockets • Historical data • Favorites • Auth
        </div>
      </div>
    </div>
  )
}