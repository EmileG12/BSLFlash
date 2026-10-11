import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

interface UserRolesState {
  isAdmin: boolean
  isSuperadmin: boolean
  loading: boolean
}

/** Whether the signed-in user holds the admin and/or superadmin role, via the is_admin()/is_superadmin() RPCs. Gates the Admin nav entry and the AdminRoute/SuperadminRoute guards -- re-resolves whenever the session changes. */
export function useUserRoles(): UserRolesState {
  const { session, loading: authLoading } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)
  const [isSuperadmin, setIsSuperadmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return

    let cancelled = false

    const rolesPromise = session
      ? Promise.all([supabase.rpc('is_admin'), supabase.rpc('is_superadmin')])
      : Promise.resolve([{ data: false }, { data: false }] as const)

    rolesPromise.then(([adminResult, superadminResult]) => {
      if (cancelled) return
      setIsAdmin(adminResult.data ?? false)
      setIsSuperadmin(superadminResult.data ?? false)
      setLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [session, authLoading])

  return { isAdmin, isSuperadmin, loading }
}
