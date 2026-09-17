import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

/** Routes only reachable when signed out (e.g. the login page) — redirects away if already authenticated. */
export function GuestRoute() {
  const { session, loading } = useAuth()

  if (loading) return null
  if (session) return <Navigate to="/" replace />

  return <Outlet />
}
