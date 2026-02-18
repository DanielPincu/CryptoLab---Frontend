import { Navigate, useLocation } from 'react-router-dom'
import { useSession } from './Session'

export function RequireAuth({ children }: { children: JSX.Element }) {
  const { user, isLoading } = useSession()
  const location = useLocation()

  if (isLoading) {
    return <div className="p-4 text-sm text-gray-400">Loading…</div>
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return children
}