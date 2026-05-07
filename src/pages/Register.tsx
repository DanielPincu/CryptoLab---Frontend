import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSession } from '../auth/Session'

const registerHighlights = [
  {
    label: 'Paper trading',
    value: 'Paper trading',
    detail: 'Create an account and trade with simulated balances from the start.'
  },
  {
    label: 'Risk',
    value: 'Zero real money',
    detail: 'Learn position sizing and timing without risking personal capital.'
  },
  {
    label: 'Practice',
    value: 'Live context',
    detail: 'Research symbols with market data while keeping every trade simulated.'
  }
]

export default function Register() {
  const navigate = useNavigate()
  const { register } = useSession()

  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

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
      navigate('/home')
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Registration failed'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-72px)] overflow-hidden bg-slate-950">
      <section className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-14">
        <div className="flex min-h-[420px] flex-col justify-center lg:min-h-[680px]">
          <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-300">
            Start Zero-Risk Practice
          </div>

          <h1 className="max-w-3xl text-4xl font-bold tracking-normal text-slate-50 sm:text-5xl lg:text-6xl">
            Create a paper trading account with no real-money risk.
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
            Use simulated funds to place practice trades, research symbols, and track portfolio activity without deposits or real losses.
          </p>

          <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {registerHighlights.map((item) => (
              <div
                key={item.label}
                className="rounded-lg border border-slate-800 bg-slate-900/80 p-4"
              >
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{item.label}</div>
                <div className="mt-2 text-sm font-semibold text-slate-100">{item.value}</div>
                <p className="mt-2 text-sm leading-6 text-slate-400">{item.detail}</p>
              </div>
            ))}
          </div>

        </div>

        <div className="relative flex items-center lg:min-h-[680px]">
          <div className="absolute inset-0 rounded-[2rem] bg-[radial-gradient(circle_at_top_left,rgba(52,211,153,0.18),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(56,189,248,0.12),transparent_35%)]" />
          <div className="relative w-full rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-2xl shadow-slate-950/70 backdrop-blur sm:p-5">
            <div className="mb-5 border-b border-slate-800 pb-4">
              <div className="text-sm text-slate-400">Create your account</div>
              <div className="mt-1 text-2xl font-bold text-slate-50">Start paper trading</div>
            </div>

            {error && (
              <div className="mb-4 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
                {error}
              </div>
            )}

            <form className="space-y-4" onSubmit={onSubmit}>
              <label className="block text-sm font-medium text-slate-300">
                Username
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                  className="mt-2 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-3 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-60"
                  placeholder="yourname"
                  autoComplete="username"
                />
              </label>

              <label className="block text-sm font-medium text-slate-300">
                Email
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="mt-2 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-3 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-60"
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </label>

              <label className="block text-sm font-medium text-slate-300">
                Password
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    className="mt-2 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-3 pr-20 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-60"
                    placeholder="Type your password"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-2 top-[calc(50%+0.25rem)] -translate-y-1/2 rounded-md px-2 py-1 text-xs font-semibold text-slate-400 transition hover:bg-slate-800 hover:text-slate-200"
                    disabled={loading}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </label>

              <label className="block text-sm font-medium text-slate-300">
                Confirm password
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    disabled={loading}
                    className="mt-2 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-3 pr-20 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-60"
                    placeholder="Type your password again"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    aria-label={showConfirm ? 'Hide password' : 'Show password'}
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-2 top-[calc(50%+0.25rem)] -translate-y-1/2 rounded-md px-2 py-1 text-xs font-semibold text-slate-400 transition hover:bg-slate-800 hover:text-slate-200"
                    disabled={loading}
                  >
                    {showConfirm ? 'Hide' : 'Show'}
                  </button>
                </div>
              </label>

              <button
                disabled={loading}
                className="inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-emerald-400/50 bg-emerald-400 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-950/30 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
                type="submit"
              >
                {loading ? 'Creating...' : 'Create account'}
              </button>
            </form>

            <div className="mt-5 rounded-lg border border-slate-800 bg-slate-950/70 p-4 text-sm text-slate-400">
              Already have an account?{' '}
              <Link className="font-semibold text-sky-300 transition hover:text-sky-200" to="/login">
                Go to login
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
