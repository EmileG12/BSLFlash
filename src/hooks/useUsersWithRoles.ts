import { useEffect, useState } from 'react'
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

/** Every user with their roles and ban status, via the superadmin-only list_users_with_roles() RPC. Shared by the Roles Management and Account Management pages. */
export function useUsersWithRoles(): UsersWithRolesState {
  const [users, setUsers] = useState<UserWithRoles[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    supabase
      .rpc('list_users_with_roles')
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) {
          setError(error.message)
        } else {
          setUsers(data)
        }
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  return { users, loading, error, setUsers }
}
