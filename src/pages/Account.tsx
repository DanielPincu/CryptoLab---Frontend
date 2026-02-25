import { useEffect, useState } from 'react'
import { apiAccountMe, apiAccountAddFavorite, apiAccountRemoveFavorite, apiAccountResetFavorites } from '../api/account.api'
import type { IAccount } from '../interfaces/account.interface'

export default function Account() {
  const [account, setAccount] = useState<IAccount | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newSymbol, setNewSymbol] = useState('')
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

  const handleAddFavorite = async () => {
    if (!newSymbol.trim()) return

    try {
      setUpdating(true)
      setError(null)

      const updated = await apiAccountAddFavorite(newSymbol.trim().toUpperCase())
      setAccount((prev) =>
        prev ? { ...prev, favorites: updated.favorites } : prev
      )
      setNewSymbol('')
    } catch {
      setError('Failed to add favorite')
    } finally {
      setUpdating(false)
    }
  }

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
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
      <h2 className="font-semibold mb-2">Account</h2>

      <div className="text-sm text-slate-300">
        Balance:{' '}
        <span className="font-mono">
          {typeof account.cashBalance === 'number'
            ? `${account.cashBalance} ${account.baseCurrency}`
            : '—'}
        </span>
      </div>

      <div className="text-sm text-slate-300 mt-4">
        <div className="font-semibold mb-2">Favorites</div>

        <div className="flex flex-wrap gap-2 mb-3">
          <input
            value={newSymbol}
            onChange={(e) => setNewSymbol(e.target.value)}
            placeholder="Add symbol (e.g. BTCUSDT)"
            className="px-3 py-2 rounded bg-slate-800 border border-slate-700 text-sm"
          />
          <button
            onClick={handleAddFavorite}
            disabled={updating}
            className="px-3 py-2 rounded bg-emerald-600 text-white text-sm disabled:opacity-50"
          >
            Add
          </button>

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
                className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-800 text-sm font-mono font-semibold"
              >
                {s}
                <button
                  onClick={() => handleRemoveFavorite(s)}
                  disabled={updating}
                  className="text-rose-400 hover:text-rose-300 text-sm"
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