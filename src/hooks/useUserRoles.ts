import { useQuery } from '@tanstack/react-query'
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

  const { data, isPending } = useQuery({
    queryKey: ['userRoles', session?.user.id ?? null],
    queryFn: async () => {
      if (!session) return { isAdmin: false, isSuperadmin: false }
      const [adminResult, superadminResult] = await Promise.all([
        supabase.rpc('is_admin'),
        supabase.rpc('is_superadmin'),
      ])
      return { isAdmin: adminResult.data ?? false, isSuperadmin: superadminResult.data ?? false }
    },
    enabled: !authLoading,
  })

  return {
    isAdmin: data?.isAdmin ?? false,
    isSuperadmin: data?.isSuperadmin ?? false,
    // isPending stays true while the query is disabled (authLoading), since it never settles.
    loading: authLoading || isPending,
  }
}
