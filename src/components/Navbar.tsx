import { Link, useNavigate } from 'react-router-dom'
import { useSession } from '../auth/Session'

export default function Navbar() {
  const navigate = useNavigate()
  const { user, isAuthenticated, isLoading, logout } = useSession()

  async function onLogout() {
    logout()
    navigate('/login')
  }

  // Prevent flicker while auth state is loading
  if (isLoading) return null

  return (
    <nav className="flex items-center justify-between gap-4 p-4 border-b">
      <div className="flex items-center gap-4">
        <Link to="/" className="font-semibold hover:underline">
          Home
        </Link>

        {isAuthenticated && (
          <Link to="/dashboard" className="hover:underline">
            Dashboard
          </Link>
        )}
      </div>

      <div className="flex items-center gap-3">
        {!isAuthenticated ? (
          <>
            <Link to="/login" className="hover:underline">
              Login
            </Link>
            <Link to="/register" className="hover:underline">
              Register
            </Link>
          </>
        ) : (
          <>
            <span className="text-sm text-slate-400">
              {user?.username}
            </span>
            <button
              onClick={onLogout}
              className="rounded-md border px-3 py-1 text-sm hover:bg-slate-100/10"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  )
}