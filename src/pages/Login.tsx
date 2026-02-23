import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSession } from '../auth/Session';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useSession()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState<boolean>(() => Boolean(localStorage.getItem('rememberEmail')))
  const [rememberPassword, setRememberPassword] = useState<boolean>(() => Boolean(localStorage.getItem('rememberPassword')))

  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberEmail')
    if (rememberedEmail) setEmail(rememberedEmail)

    const rememberedPassword = localStorage.getItem('rememberPassword')
    if (rememberedPassword) setPassword(rememberedPassword)
  }, [])

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

      if (rememberPassword) {
        localStorage.setItem('rememberPassword', password)
      } else {
        localStorage.removeItem('rememberPassword')
      }
      await login(email, password)
      navigate('/dashboard')
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Login failed. Please try again.'
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 mt-10 shadow-xl">
        <div className="mb-3 flex items-center justify-between">
          <h1 className="text-lg font-semibold">Login</h1>
        </div>

        <p className="text-sm text-slate-400 mb-4">
          Login to trade and view your portfolio.
        </p>

        <form className="space-y-3" onSubmit={onSubmit}>
          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {error}
            </div>
          )}

          <label className="block text-sm text-slate-300">
            Email
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={submitting}
              className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500/40 disabled:opacity-60"
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </label>

          <label className="block text-sm text-slate-300">
            Password
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={submitting}
                className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 pr-10 outline-none focus:ring-2 focus:ring-emerald-500/40 disabled:opacity-60"
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-slate-300 hover:bg-slate-800"
                disabled={submitting}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </label>

          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={submitting}
                className="h-4 w-4 rounded border-slate-700 bg-slate-950"
              />
              Remember email
            </label>

            <label className="flex items-center gap-2 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={rememberPassword}
                onChange={(e) => setRememberPassword(e.target.checked)}
                disabled={submitting}
                className="h-4 w-4 rounded border-slate-700 bg-slate-950"
              />
              Remember password (not recommended on shared devices)
            </label>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-emerald-200 hover:bg-emerald-500/15 disabled:opacity-60"
          >
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div className="mt-4 text-sm text-slate-400">
          No account?{' '}
          <Link className="text-sky-300 hover:underline" to="/register">
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}