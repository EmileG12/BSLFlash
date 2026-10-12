import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export interface UserWithRoles {
  user_id: string
  email: string | null
  user_name: string | null
  banned_until: string | null
  roles: string[]
}

interface UsersWithRolesState {
  users: UserWithRoles[]
  loading: boolean
  error: string | null
  setUsers: React.Dispatch<React.SetStateAction<UserWithRoles[]>>
}

const queryKey = ['usersWithRoles']

/** Every user with their roles and ban status, via the superadmin-only list_users_with_roles() RPC. Shared by the Roles Management and Account Management pages. */
export function useUsersWithRoles(): UsersWithRolesState {
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('list_users_with_roles')
      if (error) throw new Error(error.message)
      return data
    },
  })

  const setUsers: React.Dispatch<React.SetStateAction<UserWithRoles[]>> = (update) => {
    queryClient.setQueryData<UserWithRoles[]>(queryKey, (previous) =>
      previous === undefined ? previous : typeof update === 'function' ? update(previous) : update,
    )
  }

  return { users: data ?? [], loading: isLoading, error: error?.message ?? null, setUsers }
}
