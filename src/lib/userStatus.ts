import type { UserWithRoles } from '../hooks/useUsersWithRoles'

export function isBanned(user: UserWithRoles): boolean {
  if (user.banned_until === null) return false
  // Postgres serializes an indefinite ban as the literal 'infinity', which
  // `new Date(...)` can't parse (it silently becomes an Invalid Date that
  // compares as false against everything) -- check for it explicitly.
  if (user.banned_until === 'infinity') return true
  return new Date(user.banned_until) > new Date()
}
