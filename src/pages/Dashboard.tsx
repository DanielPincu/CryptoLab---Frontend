import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { http } from '../api/http.api'
import type { IUser } from '../interfaces/user.interface'
import type { IAccount } from '../interfaces/account.interface'

export default function Dashboard() {
  const hasToken = Boolean(localStorage.getItem('token'))
  const [loading, setLoading] = useState(hasToken)
  const [me, setMe] = useState<IUser | null>(null)
  const [account, setAccount] = useState<IAccount | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      return
    }

    Promise.all([
      http.get('/user/me'),
      http.get('/account/me')
    ])
      .then(([meRes, accRes]) => {
        setMe(meRes.data?.user ?? meRes.data)
        setAccount(accRes.data)
      })
      .catch(() => setError('Failed to load dashboard data'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="p-6 text-slate-300">Loading dashboard…</div>
  }

  if (!me) {
    return (
      <div className="p-6">
        <h2 className="text-lg font-semibold mb-2">You are not logged in</h2>
        <p className="text-slate-400 mb-3">Log in to see your dashboard.</p>
        <Link className="text-emerald-400 underline" to="/login">Go to Login</Link>
      </div>
    )
  }

  return (
    <div className="p-6 grid gap-4 grid-cols-1 md:grid-cols-2">
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        <h2 className="font-semibold mb-2">Profile</h2>
        <div className="text-sm text-slate-300">Username: <span className="font-mono">{me.username}</span></div>
        <div className="text-sm text-slate-300">Email: <span className="font-mono">{me.email}</span></div>
        <div className="mt-3 flex gap-3">
          <Link to="/profile" className="text-emerald-400 underline">Edit profile</Link>
          <Link to="/" className="text-sky-400 underline">Go to market</Link>
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        <h2 className="font-semibold mb-2">Account</h2>
        {error && <div className="text-rose-400 text-sm mb-2">{error}</div>}
        {account ? (
          <>
            <div className="text-sm text-slate-300">
              Balance: <span className="font-mono">{account.cashBalance} {account.baseCurrency}</span>
            </div>
            <div className="text-sm text-slate-300 mt-2">
              Favorites:
              {account.favorites?.length ? (
                <ul className="mt-1 flex flex-wrap gap-2">
                  {account.favorites.map((s) => (
                    <li key={s} className="px-2 py-1 rounded bg-slate-800 text-xs font-mono">
                      {s}
                    </li>
                  ))}
                </ul>
              ) : (
                <span className="ml-2 text-slate-400">No favorites yet</span>
              )}
            </div>
            <div className="mt-3">
              <Link to="/profile" className="text-emerald-400 underline">Manage favorites</Link>
            </div>
          </>
        ) : (
          <div className="text-slate-400 text-sm">No account found</div>
        )}
      </div>
    </div>
  )
}