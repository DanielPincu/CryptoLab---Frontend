import { useEffect, useState } from 'react'
import { apiAccountMe, apiAccountRemoveFavorite, apiAccountResetFavorites } from '../api/account.api'
import type { IAccount } from '../interfaces/account.interface'
import PortfolioSummary from '../components/PortfolioSummary'

export default function Account() {
  const [account, setAccount] = useState<IAccount | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    const loadAccount = async () => {
      try {
        const data = await apiAccountMe()
        setAccount(data)
      } catch {
        setError('Failed to load account data')
      } finally {
        setLoading(false)
      }
    }

    loadAccount()
  }, [])

  const handleRemoveFavorite = async (symbol: string) => {
    try {
      setUpdating(true)
      setError(null)

      const updated = await apiAccountRemoveFavorite(symbol)
      setAccount((prev) =>
        prev ? { ...prev, favorites: updated.favorites } : prev
      )
    } catch {
      setError('Failed to remove favorite')
    } finally {
      setUpdating(false)
    }
  }

  const handleResetFavorites = async () => {
    try {
      setUpdating(true)
      setError(null)

      const updated = await apiAccountResetFavorites()
      setAccount((prev) =>
        prev ? { ...prev, favorites: updated.favorites } : prev
      )
    } catch {
      setError('Failed to reset favorites')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return <div className="p-6 text-slate-300">Loading account…</div>
  }

  if (error) {
    return <div className="p-6 text-rose-400">{error}</div>
  }

  if (!account) {
    return <div className="p-6 text-slate-400">No account found</div>
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Account Overview</h2>
        <span className="text-xs text-slate-400">Overview and favorites</span>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-lg">
        <PortfolioSummary />
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="font-semibold text-white">Favorites</div>
          <span className="text-xs text-slate-400">Watchlist symbols</span>
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          <button
            onClick={handleResetFavorites}
            disabled={updating}
            className="px-3 py-2 rounded bg-amber-600 text-white text-sm disabled:opacity-50"
          >
            Reset to Default
          </button>
        </div>

        {account.favorites?.length ? (
          <ul className="flex flex-wrap gap-3">
            {account.favorites.map((s) => (
              <li
                key={s}
                className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition text-sm font-mono font-semibold border border-slate-700"
              >
                {s}
                <button
                  onClick={() => handleRemoveFavorite(s)}
                  disabled={updating}
                  className="text-rose-400 hover:text-rose-300 text-xs font-bold px-1"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <span className="text-slate-400">No favorites yet</span>
        )}
      </div>
    </div>
  )
}