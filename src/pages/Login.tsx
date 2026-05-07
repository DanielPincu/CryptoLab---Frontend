import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSession } from '../auth/Session'

const loginHighlights = [
  {
    label: 'Paper trading',
    value: 'Simulated funds',
    detail: 'Practice entries and exits without putting real money at stake.'
  },
  {
    label: 'Risk',
    value: 'Zero capital',
    detail: 'Manage positions and buying power with no personal funds exposed.'
  },
  {
    label: 'Market context',
    value: 'Live prices',
    detail: 'Use current market data to make practice feel realistic.'
  }
]

export default function Login() {
  const navigate = useNavigate()
  const { login } = useSession()

  const [email, setEmail] = useState(() => localStorage.getItem('rememberEmail') || '')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState<boolean>(() => Boolean(localStorage.getItem('rememberEmail')))


  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      if (rememberMe) {
        localStorage.setItem('rememberEmail', email)
      } else {
        localStorage.removeItem('rememberEmail')
      }

      await login(email, password)
      navigate('/home')
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Login failed. Please try again.'
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-72px)] overflow-hidden bg-slate-950">
      <section className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8 lg:py-14">
        <div className="relative order-2 flex items-center lg:order-1 lg:min-h-[620px]">
          <div className="absolute inset-0 rounded-[2rem] bg-[radial-gradient(circle_at_top_left,rgba(52,211,153,0.18),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(56,189,248,0.12),transparent_35%)]" />
          <div className="relative w-full rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-2xl shadow-slate-950/70 backdrop-blur sm:p-5">
            <div className="mb-5 border-b border-slate-800 pb-4">
              <div className="text-sm text-slate-400">Welcome back</div>
              <div className="mt-1 text-2xl font-bold text-slate-50">Return to zero-risk trading</div>
            </div>

            <form className="space-y-4" onSubmit={onSubmit}>
              {error && (
                <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
                  {error}
                </div>
              )}

              <label className="block text-sm font-medium text-slate-300">
                Email
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={submitting}
                  className="mt-2 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-3 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-60"
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                  data-testid="email-input"
                />
              </label>

              <label className="block text-sm font-medium text-slate-300">
                Password
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={submitting}
                    className="mt-2 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-3 pr-20 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-60"
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                    data-testid="password-input"
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-2 top-[calc(50%+0.25rem)] -translate-y-1/2 rounded-md px-2 py-1 text-xs font-semibold text-slate-400 transition hover:bg-slate-800 hover:text-slate-200"
                    disabled={submitting}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </label>

              <div className="rounded-lg border border-slate-800 bg-slate-950/70 px-3 py-3">
                <label className="flex items-center gap-3 text-sm text-slate-300">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={submitting}
                    className="h-4 w-4 rounded border-slate-700 bg-slate-950 accent-emerald-400"
                  />
                  Remember email on this device
                </label>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-emerald-400/50 bg-emerald-400 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-950/30 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
                data-testid="login-submit"
              >
                {submitting ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

            <div className="mt-5 rounded-lg border border-slate-800 bg-slate-950/70 p-4 text-sm text-slate-400">
              New to CryptoLab?{' '}
              <Link className="font-semibold text-sky-300 transition hover:text-sky-200" to="/register">
                Create an account
              </Link>
            </div>
          </div>
        </div>

        <div className="order-1 flex min-h-[420px] flex-col justify-center lg:order-2 lg:min-h-[620px]">
          <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-300">
            Zero-Risk Paper Trading
          </div>

          <h1 className="max-w-3xl text-4xl font-bold tracking-normal text-slate-50 sm:text-5xl lg:text-6xl">
            Sign in and keep practicing without real-money risk.
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
            Continue trading with simulated funds, monitor live prices, and manage practice positions without exposing your own capital.
          </p>

          <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {loginHighlights.map((item) => (
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

          <div className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Practice mode</div>
                <div className="mt-2 text-lg font-semibold text-slate-100">No deposits, no real losses</div>
              </div>
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm font-semibold text-emerald-300">
                Paper
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
