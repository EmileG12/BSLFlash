import { Navigate, Outlet } from 'react-router-dom'
import { useUserRoles } from '../hooks/useUserRoles'

/** Guards /admin -- accessible to admins and superadmins (superadmin passes every admin-gated route too, even though it isn't literally the 'admin' DB role). */
export function AdminRoute() {
  const { isAdmin, isSuperadmin, loading } = useUserRoles()

  if (loading) return null
  if (!isAdmin && !isSuperadmin) return <Navigate to="/" replace />

  return <Outlet />
}
