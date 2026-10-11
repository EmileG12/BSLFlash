import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { supabase } from '../lib/supabase'
import { useSavedDecks } from './useSavedDecks'

vi.mock('../lib/supabase', () => ({
  supabase: {
    rpc: vi.fn(),
  },
}))

describe('useSavedDecks', () => {
  it('starts in a loading state', () => {
    vi.mocked(supabase.rpc).mockReturnValue(new Promise(() => {}) as never)

    const { result } = renderHook(() => useSavedDecks())

    expect(result.current.loading).toBe(true)
    expect(result.current.savedDecks).toEqual([])
  })

  it('returns the fetched saved decks', async () => {
    vi.mocked(supabase.rpc).mockResolvedValue({
      data: [{ id: '1', deck_name: 'GCSE Pack', owner_user_id: 'user-2', owner_name: 'bob' }],
      error: null,
    } as never)

    const { result } = renderHook(() => useSavedDecks())

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.savedDecks).toEqual([
      { id: '1', deck_name: 'GCSE Pack', owner_user_id: 'user-2', owner_name: 'bob' },
    ])
  })

  it('sets an error message when the fetch fails', async () => {
    vi.mocked(supabase.rpc).mockResolvedValue({ data: null, error: { message: 'boom' } } as never)

    const { result } = renderHook(() => useSavedDecks())

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBe('boom')
  })

  it('setSavedDecks lets the caller remove a deck locally', async () => {
    vi.mocked(supabase.rpc).mockResolvedValue({
      data: [{ id: '1', deck_name: 'GCSE Pack', owner_user_id: 'user-2', owner_name: 'bob' }],
      error: null,
    } as never)

    const { result } = renderHook(() => useSavedDecks())
    await waitFor(() => expect(result.current.loading).toBe(false))

    act(() => {
      result.current.setSavedDecks((previous) => previous.filter((deck) => deck.id !== '1'))
    })

    expect(result.current.savedDecks).toEqual([])
  })
})
