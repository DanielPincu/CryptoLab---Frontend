import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useSession } from '../auth/Session'
import { useState, useEffect } from 'react'

export default function Navbar() {
  const navigate = useNavigate()
  const { user, isAuthenticated, isLoading, logout } = useSession()
  const [open, setOpen] = useState(false)

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
        to="/portfolio"
        onClick={() => setOpen(false)}
        className={({ isActive }) =>
          isActive
            ? 'text-emerald-400 font-semibold'
            : 'text-slate-300 hover:text-emerald-400'
        }
      >
        Portfolio
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
      <nav className="sticky top-0 z-[1200] flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
        <Link
          to="/"
          className="font-bold text-xl tracking-wider text-emerald-400 hover:text-emerald-300 transition"
        >
          CryptoLab
        </Link>

        {isAuthenticated && (
          <div className="hidden md:flex items-center gap-6 text-sm text-slate-300">
            {navLinks}
          </div>
        )}

        <div className="flex items-center gap-4">
          {isAuthenticated && (
            <Link
              to="/profile"
              className="hidden md:block text-sm font-semibold text-emerald-300 hover:text-emerald-400 transition"
            >
              {user?.username}
            </Link>
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

      <div
        className={`fixed inset-0 z-[900] bg-black/40 backdrop-blur-sm transition-opacity ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setOpen(false)}
      />

      <div
        className={`fixed top-[64px] right-0 z-[1000] h-[calc(100%-64px)] w-64 bg-slate-950 border-l border-slate-800 transform transition-transform ${
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