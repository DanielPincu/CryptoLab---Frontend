import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useSession } from '../auth/Session'
import { useState, useEffect } from 'react'
import MarketTicker from './MarketTicker'
import { usePrecisionStore } from '../state/usePrecisionStore'

export default function Navbar() {
  const navigate = useNavigate()
  const { user, isAuthenticated, isLoading, logout } = useSession()
  const [open, setOpen] = useState(false)
  const precision = usePrecisionStore((state) => state.precision)
  const togglePrecision = usePrecisionStore((state) => state.togglePrecision)
  const nextPrecision = precision === 2 ? 4 : precision === 4 ? 8 : 2

  useEffect(() => {
    // Reserve scrollbar space globally to avoid layout shift between pages
    document.documentElement.style.scrollbarGutter = 'stable'
  }, [])

  async function onLogout() {
    await logout()
    navigate('/')
    setOpen(false)
  }

  if (isLoading) return null

  const navLinks = (
    <>
      <NavLink
        to="/dashboard"
        onClick={() => setOpen(false)}
        className={({ isActive }) =>
          isActive
            ? 'text-emerald-400 font-semibold'
            : 'text-slate-300 hover:text-emerald-400'
        }
      >
        Dashboard
      </NavLink>

      <NavLink
        to="/research"
        onClick={() => setOpen(false)}
        className={({ isActive }) =>
          isActive
            ? 'text-emerald-400 font-semibold'
            : 'text-slate-300 hover:text-emerald-400'
        }
      >
        Research
      </NavLink>

      <NavLink
        to="/positions"
        onClick={() => setOpen(false)}
        className={({ isActive }) =>
          isActive
            ? 'text-emerald-400 font-semibold'
            : 'text-slate-300 hover:text-emerald-400'
        }
      >
        Positions
      </NavLink>

      <NavLink
        to="/transactions"
        onClick={() => setOpen(false)}
        className={({ isActive }) =>
          isActive
            ? 'text-emerald-400 font-semibold'
            : 'text-slate-300 hover:text-emerald-400'
        }
      >
        Transactions
      </NavLink>

      <NavLink
        to="/leaderboard"
        onClick={() => setOpen(false)}
        className={({ isActive }) =>
          isActive
            ? 'text-emerald-400 font-semibold'
            : 'text-slate-300 hover:text-emerald-400'
        }
      >
        Leaderboard
      </NavLink>

      <NavLink
        to="/game"
        onClick={() => setOpen(false)}
        className={({ isActive }) =>
          (isActive
            ? 'text-emerald-400 font-semibold text-2xl'
            : 'text-slate-300 hover:text-emerald-400 text-2xl')
        }
      >
        Play Big Dollar
      </NavLink>
    </>
  )

  return (
    <>
      <header className="sticky top-0 z-[1200] bg-slate-950">
        <nav className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
          <Link
            to="/"
            aria-label="Go to CryptoLab home"
            className="group flex items-center gap-3 rounded-lg px-2 py-1.5 transition hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-500/40 bg-emerald-500/10 shadow-sm shadow-emerald-950/40 transition group-hover:border-emerald-400/70 group-hover:bg-emerald-400/15">
              <span className="font-mono text-sm font-black text-emerald-300">CL</span>
            </span>
            <span className="flex flex-col leading-none">
              <span className="text-lg font-bold tracking-normal text-slate-50 transition group-hover:text-emerald-300">
                CryptoLab
              </span>
              <span className="hidden text-[10px] font-semibold uppercase tracking-wide text-slate-500 transition group-hover:text-slate-400 sm:block">
                Trading Workspace
              </span>
            </span>
          </Link>

          {isAuthenticated && (
            <div className="hidden md:flex items-center gap-6 text-sm text-slate-300">
              {navLinks}
            </div>
          )}

          <div className="flex items-center gap-4">
            {isAuthenticated && (
              <div className="hidden md:flex items-center gap-2">
                <button
                  type="button"
                  onClick={togglePrecision}
                  className="flex items-center gap-1 rounded border border-slate-700 px-2 py-1 text-xs font-semibold text-slate-300 transition hover:border-emerald-500/50 hover:bg-slate-800 hover:text-emerald-300"
                  aria-label={`Switch to ${nextPrecision} decimal precision`}
                  title={`Showing ${precision} decimals`}
                >
                  <span>Precision</span>
                  <span className="font-mono">.{precision}</span>
                </button>
                <Link
                  to="/profile"
                  className="text-sm font-semibold text-emerald-300 hover:text-emerald-400 transition"
                >
                  {user?.username}
                </Link>
              </div>
            )}

            {!isAuthenticated ? (
              <div className="hidden md:flex gap-4">
                <Link to="/login" className="hover:text-emerald-400">Login</Link>
                <Link to="/register" className="hover:text-emerald-400">Register</Link>
              </div>
            ) : (
              <button
                onClick={onLogout}
                className="hidden md:block text-sm border border-slate-700 px-3 py-1 rounded hover:bg-slate-800"
              >
                Logout
              </button>
            )}

            <button
              onClick={() => setOpen((prev) => !prev)}
              className={`relative z-[1300] md:hidden flex flex-col gap-1 transition-transform duration-300 ${open ? 'rotate-90' : 'rotate-0'}`}
            >
              <span className="w-6 h-[2px] bg-slate-300"></span>
              <span className="w-6 h-[2px] bg-slate-300"></span>
              <span className="w-6 h-[2px] bg-slate-300"></span>
            </button>
          </div>
        </nav>

        {isAuthenticated && <MarketTicker />}
      </header>

      <div
        className={`fixed inset-0 z-[900] bg-black/40 backdrop-blur-sm transition-opacity ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setOpen(false)}
      />

      <div
        className={`fixed ${isAuthenticated ? 'top-[100px] h-[calc(100%-100px)]' : 'top-[64px] h-[calc(100%-64px)]'} right-0 z-[1000] w-64 bg-slate-950 border-l border-slate-800 transform transition-transform ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-6 flex flex-col gap-6 text-slate-300">
          {isAuthenticated && navLinks}

          {!isAuthenticated ? (
            <>
              <Link to="/login" onClick={() => setOpen(false)}>Login</Link>
              <Link to="/register" onClick={() => setOpen(false)}>Register</Link>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={togglePrecision}
                className="w-fit rounded border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-emerald-500/50 hover:bg-slate-800 hover:text-emerald-300"
                aria-label={`Switch to ${nextPrecision} decimal precision`}
              >
                Precision <span className="font-mono">.{precision}</span>
              </button>
              <Link
                to="/profile"
                onClick={() => setOpen(false)}
                className="text-sm font-semibold text-emerald-300 hover:text-emerald-400 transition"
              >
                {user?.username}
              </Link>
              <button
                onClick={onLogout}
                className="text-left border border-slate-700 px-3 py-2 rounded hover:bg-slate-800"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </>
  )
}
