import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="max-w-2xl w-full p-8 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur shadow-xl">
        <h1 className="text-3xl font-bold mb-2">CryptoLab</h1>
        <p className="text-slate-300 mb-6">
          Track live crypto prices, manage your favorites, and explore market history in one place.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link
            to="/dashboard"
            className="text-center rounded-lg border border-slate-800 bg-slate-950 px-4 py-3 font-semibold hover:border-emerald-500/40 hover:text-emerald-300 transition"
          >
            Dashboard
          </Link>

          <Link
            to="/login"
            className="text-center rounded-lg border border-slate-800 bg-slate-950 px-4 py-3 font-semibold hover:border-sky-500/40 hover:text-sky-300 transition"
          >
            Login
          </Link>

          <Link
            to="/register"
            className="text-center rounded-lg border border-slate-800 bg-slate-950 px-4 py-3 font-semibold hover:border-violet-500/40 hover:text-violet-300 transition"
          >
            Register
          </Link>
        </div>

        <div className="mt-6 text-sm text-slate-400">
          Live prices via WebSockets • Historical data • Favorites • Auth
        </div>
      </div>
    </div>
  )
}