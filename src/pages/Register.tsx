import { useState } from 'react'
import { isAxiosError } from 'axios'
import { Link, useNavigate } from 'react-router-dom'
import { useSession } from '../auth/Session'

export default function Register() {
  const navigate = useNavigate()
  const { register } = useSession()

  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!username.trim()) {
      setError('Username is required')
      return
    }
    if (!email.trim()) {
      setError('Email is required')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }

    try {
      setLoading(true)
      await register(username.trim(), email.trim(), password)
      navigate('/dashboard')
    } catch (err: unknown) {
      let msg = 'Registration failed'
      if (isAxiosError(err)) {
        msg = err.response?.data?.error || err.message || msg
      }
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 mt-10 shadow-xl">
        <div className="mb-3 flex items-center justify-between">
          <h1 className="text-lg font-semibold">Register</h1>
        </div>

        <p className="text-sm text-slate-400 mb-4">
          Create an account to start paper trading.
        </p>

        {error && (
          <div className="mb-3 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-rose-300 text-sm">
            {error}
          </div>
        )}

        <form className="space-y-3" onSubmit={onSubmit}>
          <label className="block text-sm text-slate-300">
            Username
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500/40"
              placeholder="yourname"
              autoComplete="username"
            />
          </label>

          <label className="block text-sm text-slate-300">
            Email
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500/40"
              placeholder="you@example.com"
              autoComplete="email"
            />
          </label>

          <label className="block text-sm text-slate-300">
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500/40"
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </label>

          <label className="block text-sm text-slate-300">
            Confirm password
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500/40"
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </label>

          <button
            disabled={loading}
            className="w-full rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-emerald-200 hover:bg-emerald-500/15 disabled:opacity-60"
            type="submit"
          >
            {loading ? 'Creating…' : 'Create account'}
          </button>
        </form>

        <div className="mt-4 text-sm text-slate-400">
          Already have an account?{' '}
          <Link className="text-sky-300 hover:underline" to="/login">
            Go to login
          </Link>
        </div>
      </div>
    </div>
  )
}
