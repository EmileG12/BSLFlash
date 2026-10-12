import { waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { supabase } from '../lib/supabase'
import { renderHookWithQueryClient } from '../test/renderHookWithQueryClient'
import { useAuth } from './useAuth'
import { useUserRoles } from './useUserRoles'

vi.mock('./useAuth', () => ({
  useAuth: vi.fn(),
}))

vi.mock('../lib/supabase', () => ({
  supabase: {
    rpc: vi.fn(),
  },
}))

function mockRoles(isAdmin: boolean, isSuperadmin: boolean) {
  vi.mocked(supabase.rpc).mockImplementation((fn: string) => {
    if (fn === 'is_admin') return Promise.resolve({ data: isAdmin, error: null }) as never
    if (fn === 'is_superadmin') return Promise.resolve({ data: isSuperadmin, error: null }) as never
    throw new Error(`unexpected rpc call: ${fn}`)
  })
}

describe('useUserRoles', () => {
  it('stays loading while auth itself is still loading', () => {
    vi.mocked(useAuth).mockReturnValue({ session: null, loading: true })

    const { result } = renderHookWithQueryClient(() => useUserRoles())

    expect(result.current.loading).toBe(true)
    expect(result.current.isAdmin).toBe(false)
    expect(result.current.isSuperadmin).toBe(false)
  })

  it('resolves to no roles without calling the RPCs when there is no session', async () => {
    vi.mocked(useAuth).mockReturnValue({ session: null, loading: false })

    const { result } = renderHookWithQueryClient(() => useUserRoles())

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.isAdmin).toBe(false)
    expect(result.current.isSuperadmin).toBe(false)
    expect(supabase.rpc).not.toHaveBeenCalled()
  })

  it('resolves isAdmin/isSuperadmin from the RPCs when signed in', async () => {
    vi.mocked(useAuth).mockReturnValue({ session: { user: { id: 'u1' } } as never, loading: false })
    mockRoles(true, false)

    const { result } = renderHookWithQueryClient(() => useUserRoles())

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.isAdmin).toBe(true)
    expect(result.current.isSuperadmin).toBe(false)
  })

  it('treats a superadmin as not also holding the admin role unless the RPC says so', async () => {
    vi.mocked(useAuth).mockReturnValue({ session: { user: { id: 'u1' } } as never, loading: false })
    mockRoles(false, true)

    const { result } = renderHookWithQueryClient(() => useUserRoles())

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.isAdmin).toBe(false)
    expect(result.current.isSuperadmin).toBe(true)
  })
})
