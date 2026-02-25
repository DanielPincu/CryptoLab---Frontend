import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiAccountMe } from '../api/account.api'
import type { IAccount } from '../interfaces/account.interface'

export default function Account() {
  const [account, setAccount] = useState<IAccount | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

      <div className="text-sm text-slate-300 mt-2">
        Favorites:
        {account.favorites?.length ? (
          <ul className="mt-1 flex flex-wrap gap-2">
            {account.favorites.map((s) => (
              <li
                key={s}
                className="px-2 py-1 rounded bg-slate-800 text-xs font-mono"
              >
                {s}
              </li>
            ))}
          </ul>
        ) : (
          <span className="ml-2 text-slate-400">No favorites yet</span>
        )}
      </div>

      <div className="mt-3">
        <Link to="/profile" className="text-emerald-400 underline">
          Manage favorites
        </Link>
      </div>
    </div>
  )
}