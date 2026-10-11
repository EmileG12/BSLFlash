import { Navigate, Outlet } from 'react-router-dom'
import { useUserRoles } from '../hooks/useUserRoles'

/** Guards the /superadmin/* pages -- superadmin only. */
export function SuperadminRoute() {
  const { isSuperadmin, loading } = useUserRoles()

  if (loading) return null
  if (!isSuperadmin) return <Navigate to="/" replace />

  return <Outlet />
}
