import { Link } from "react-router-dom";

export default function Register() {
  return (
    <>
      <div className="mx-auto max-w-md">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 mt-10 shadow-xl">
          <div className="mb-3 flex items-center justify-between">
            <h1 className="text-lg font-semibold">Register</h1>
          </div>

          <p className="text-sm text-slate-400 mb-4">
            Create an account to start paper trading.
          </p>

          <form className="space-y-3">
            <label className="block text-sm text-slate-300">
              Email
              <input
                className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500/40"
                placeholder="you@example.com"
                autoComplete="email"
              />
            </label>

            <label className="block text-sm text-slate-300">
              Password
              <input
                type="password"
                className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500/40"
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </label>

            <label className="block text-sm text-slate-300">
              Confirm password
              <input
                type="password"
                className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500/40"
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </label>

            <button
              className="w-full rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-emerald-200 hover:bg-emerald-500/15 disabled:opacity-60"
            >
              Create account
            </button>
          </form>

          <div className="mt-4 text-sm text-slate-400">
            Already have an account?{" "}
            <Link className="text-sky-300 hover:underline" to="/login">
              Go to login
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
