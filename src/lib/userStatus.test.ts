import { describe, expect, it } from 'vitest'
import type { UserWithRoles } from '../hooks/useUsersWithRoles'
import { isBanned } from './userStatus'

function userWith(bannedUntil: string | null): UserWithRoles {
  return { user_id: 'u1', email: 'u1@example.com', user_name: null, banned_until: bannedUntil, roles: [] }
}

describe('isBanned', () => {
  it('is false when banned_until is null', () => {
    expect(isBanned(userWith(null))).toBe(false)
  })

  it('is true for the literal "infinity" ban_user() sets', () => {
    // Regression: `new Date('infinity')` is an Invalid Date in JS, which
    // compares as false against everything -- a naive `new Date(x) > new
    // Date()` check silently treats every banned account as active.
    expect(isBanned(userWith('infinity'))).toBe(true)
  })

  it('is true for a future timestamp', () => {
    expect(isBanned(userWith('2999-01-01T00:00:00Z'))).toBe(true)
  })

  it('is false for a past timestamp', () => {
    expect(isBanned(userWith('2000-01-01T00:00:00Z'))).toBe(false)
  })
})
