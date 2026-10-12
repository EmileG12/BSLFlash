import { describe, expect, it, vi } from 'vitest'
import { signOut } from './auth'
import { queryClient } from './queryClient'
import { supabase } from './supabase'

vi.mock('./supabase', () => ({
  supabase: {
    auth: {
      signOut: vi.fn(),
    },
  },
}))

vi.mock('./queryClient', () => ({
  queryClient: {
    clear: vi.fn(),
  },
}))

describe('signOut', () => {
  it('clears the query cache after a successful sign-out', async () => {
    vi.mocked(supabase.auth.signOut).mockResolvedValue({ error: null } as never)

    await signOut()

    expect(queryClient.clear).toHaveBeenCalledOnce()
  })

  it('does not clear the query cache when sign-out fails', async () => {
    vi.mocked(supabase.auth.signOut).mockResolvedValue({ error: { message: 'boom' } } as never)

    await expect(signOut()).rejects.toThrow()
    expect(queryClient.clear).not.toHaveBeenCalled()
  })
})
