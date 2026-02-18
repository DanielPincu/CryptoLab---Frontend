import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSession } from '../auth/Session';

export default function Login() {
  const navigate = useNavigate();
  const { login, isLoading } = useSession();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Login failed. Please try again.';
      setError(msg);
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
              className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500/40"
              placeholder="you@example.com"
              autoComplete="email"
              required
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
              autoComplete="current-password"
              required
            />
          </label>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-emerald-200 hover:bg-emerald-500/15 disabled:opacity-60"
          >
            {isLoading ? 'Signing in…' : 'Sign in'}
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