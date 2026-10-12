import { waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { supabase } from '../lib/supabase'
import { renderHookWithQueryClient } from '../test/renderHookWithQueryClient'
import { useCustomDecks } from './useCustomDecks'

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      getUser: vi.fn(),
    },
  },
}))

function mockUser() {
  vi.mocked(supabase.auth.getUser).mockResolvedValue({
    data: { user: { id: 'user-1' } },
  } as never)
}

function mockCustomDecks(result: { data?: unknown; error?: unknown }) {
  mockUser()
  const eq = vi.fn().mockReturnValue({ order: vi.fn().mockResolvedValue(result) })
  vi.mocked(supabase.from).mockReturnValue({
    select: vi.fn().mockReturnValue({ eq }),
  } as never)
  return { eq }
}

describe('useCustomDecks', () => {
  it('starts in a loading state', () => {
    mockUser()
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({ order: vi.fn().mockReturnValue(new Promise(() => {})) }),
      }),
    } as never)

    const { result } = renderHookWithQueryClient(() => useCustomDecks())

    expect(result.current.loading).toBe(true)
    expect(result.current.customDecks).toEqual([])
  })

  it('returns the fetched custom decks, scoped to the current user', async () => {
    const { eq } = mockCustomDecks({
      data: [{ id: '1', deck_name: 'My Animals' }],
      error: null,
    })

    const { result } = renderHookWithQueryClient(() => useCustomDecks())

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.customDecks).toEqual([{ id: '1', deck_name: 'My Animals' }])
    expect(eq).toHaveBeenCalledWith('user_id', 'user-1')
  })

  it('sets an error message when the fetch fails', async () => {
    mockCustomDecks({ data: null, error: { message: 'network error' } })

    const { result } = renderHookWithQueryClient(() => useCustomDecks())

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBe('network error')
  })

  it('returns an empty list when the user has no custom decks', async () => {
    mockCustomDecks({ data: [], error: null })

    const { result } = renderHookWithQueryClient(() => useCustomDecks())

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.customDecks).toEqual([])
  })

  it('returns an empty list when there is no signed-in user', async () => {
    vi.mocked(supabase.auth.getUser).mockResolvedValue({ data: { user: null } } as never)

    const { result } = renderHookWithQueryClient(() => useCustomDecks())

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.customDecks).toEqual([])
  })
})
