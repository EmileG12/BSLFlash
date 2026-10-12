import { act, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { supabase } from '../lib/supabase'
import { renderHookWithQueryClient } from '../test/renderHookWithQueryClient'
import { useUsersWithRoles } from './useUsersWithRoles'

vi.mock('../lib/supabase', () => ({
  supabase: {
    rpc: vi.fn(),
  },
}))

describe('useUsersWithRoles', () => {
  it('starts in a loading state', () => {
    vi.mocked(supabase.rpc).mockReturnValue(new Promise(() => {}) as never)

    const { result } = renderHookWithQueryClient(() => useUsersWithRoles())

    expect(result.current.loading).toBe(true)
    expect(result.current.users).toEqual([])
  })

  it('returns every user with their roles and ban status', async () => {
    vi.mocked(supabase.rpc).mockResolvedValue({
      data: [{ user_id: 'u1', email: 'a@test.com', user_name: 'Alice', banned_until: null, roles: ['admin'] }],
      error: null,
    } as never)

    const { result } = renderHookWithQueryClient(() => useUsersWithRoles())

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.users).toEqual([
      { user_id: 'u1', email: 'a@test.com', user_name: 'Alice', banned_until: null, roles: ['admin'] },
    ])
  })

  it('sets an error message when the fetch fails', async () => {
    vi.mocked(supabase.rpc).mockResolvedValue({ data: null, error: { message: 'boom' } } as never)

    const { result } = renderHookWithQueryClient(() => useUsersWithRoles())

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBe('boom')
  })

  it('setUsers lets the caller apply a local update', async () => {
    vi.mocked(supabase.rpc).mockResolvedValue({
      data: [{ user_id: 'u1', email: 'a@test.com', user_name: 'Alice', banned_until: null, roles: [] }],
      error: null,
    } as never)

    const { result } = renderHookWithQueryClient(() => useUsersWithRoles())
    await waitFor(() => expect(result.current.loading).toBe(false))

    act(() => {
      result.current.setUsers((previous) =>
        previous.map((user) => (user.user_id === 'u1' ? { ...user, banned_until: '2026-01-01' } : user)),
      )
    })

    await waitFor(() => expect(result.current.users[0].banned_until).toBe('2026-01-01'))
  })
})
