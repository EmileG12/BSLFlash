import { act, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { supabase } from '../lib/supabase'
import { renderHookWithQueryClient } from '../test/renderHookWithQueryClient'
import { usePublicDecks, type PublicDeck } from './usePublicDecks'

vi.mock('../lib/supabase', () => ({
  supabase: {
    rpc: vi.fn(),
  },
}))

const DECK: PublicDeck = {
  id: 'deck-1',
  deck_name: 'My Animals',
  owner_user_id: 'user-1',
  owner_name: 'alice',
  tag_names: ['Animals'],
  like_count: 2,
  liked_by_me: false,
  saved_by_me: false,
  created_at: '2026-01-01T00:00:00Z',
}

describe('usePublicDecks', () => {
  it('starts in a loading state', () => {
    vi.mocked(supabase.rpc).mockReturnValue(new Promise(() => {}) as never)

    const { result } = renderHookWithQueryClient(() => usePublicDecks('', [], 'likes'))

    expect(result.current.loading).toBe(true)
    expect(result.current.decks).toEqual([])
  })

  it('fetches decks with trimmed search, tag ids, and sort', async () => {
    vi.mocked(supabase.rpc).mockResolvedValue({ data: [DECK], error: null } as never)

    const { result } = renderHookWithQueryClient(() => usePublicDecks('  gcse  ', ['tag-1', 'tag-2'], 'newest'))

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(supabase.rpc).toHaveBeenCalledWith('get_public_decks', {
      p_search: 'gcse',
      p_tag_ids: ['tag-1', 'tag-2'],
      p_sort: 'newest',
    })
    expect(result.current.decks).toEqual([DECK])
  })

  it('omits search and tag filters when empty', async () => {
    vi.mocked(supabase.rpc).mockResolvedValue({ data: [], error: null } as never)

    const { result } = renderHookWithQueryClient(() => usePublicDecks('', [], 'likes'))

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(supabase.rpc).toHaveBeenCalledWith('get_public_decks', {
      p_search: undefined,
      p_tag_ids: undefined,
      p_sort: 'likes',
    })
  })

  it('sets an error message when the fetch fails', async () => {
    vi.mocked(supabase.rpc).mockResolvedValue({ data: null, error: { message: 'boom' } } as never)

    const { result } = renderHookWithQueryClient(() => usePublicDecks('', [], 'likes'))

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBe('boom')
  })

  it('setDecks lets the caller apply an optimistic update', async () => {
    vi.mocked(supabase.rpc).mockResolvedValue({ data: [DECK], error: null } as never)

    const { result } = renderHookWithQueryClient(() => usePublicDecks('', [], 'likes'))

    await waitFor(() => expect(result.current.loading).toBe(false))

    act(() => {
      result.current.setDecks((previous) =>
        previous.map((deck) => (deck.id === 'deck-1' ? { ...deck, liked_by_me: true } : deck)),
      )
    })

    // queryClient.setQueryData notifies observers via a batched microtask rather
    // than synchronously, so the update isn't visible on the same tick as the call.
    await waitFor(() => expect(result.current.decks[0].liked_by_me).toBe(true))
  })
})
