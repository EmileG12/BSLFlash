import { renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { supabase } from '../lib/supabase'
import { useTenCardsRound } from './useTenCardsRound'

vi.mock('../lib/supabase', () => ({
  supabase: {
    rpc: vi.fn(),
    storage: { from: vi.fn() },
  },
}))

function mockRpc(result: { data?: unknown; error?: unknown }) {
  vi.mocked(supabase.rpc).mockReturnValue(Promise.resolve(result) as never)
}

function mockPublicUrl(publicUrl: string) {
  vi.mocked(supabase.storage.from).mockReturnValue({
    getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl } }),
  } as never)
}

describe('useTenCardsRound', () => {
  it('starts in a loading state', () => {
    vi.mocked(supabase.rpc).mockReturnValue(new Promise(() => {}) as never)

    const { result } = renderHook(() => useTenCardsRound('cat-1', 'standard'))

    expect(result.current.loading).toBe(true)
    expect(result.current.cards).toEqual([])
  })

  it('returns every row as a Flashcard with a built video URL', async () => {
    mockRpc({
      data: [
        {
          word_id: 'word-1',
          word: 'Hello',
          definition: 'A greeting.',
          storage_path: 'hello/standard.mp4',
          format: 'mp4',
        },
        {
          word_id: 'word-2',
          word: 'World',
          definition: 'The earth.',
          storage_path: 'world/standard.mp4',
          format: 'mp4',
        },
      ],
      error: null,
    })
    mockPublicUrl('https://example.test/video.mp4')

    const { result } = renderHook(() => useTenCardsRound('cat-1', 'standard'))

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.cards).toEqual([
      { wordId: 'word-1', word: 'Hello', definition: 'A greeting.', videoUrl: 'https://example.test/video.mp4' },
      { wordId: 'word-2', word: 'World', definition: 'The earth.', videoUrl: 'https://example.test/video.mp4' },
    ])
  })

  it('sets empty when the category has no eligible words', async () => {
    mockRpc({ data: [], error: null })

    const { result } = renderHook(() => useTenCardsRound('cat-1', 'standard'))

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.empty).toBe(true)
    expect(result.current.cards).toEqual([])
  })

  it('sets an error message when the RPC call fails', async () => {
    mockRpc({ data: null, error: { message: 'boom' } })

    const { result } = renderHook(() => useTenCardsRound('cat-1', 'standard'))

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBe('boom')
  })

  it('returns fewer than requested cards when the category has fewer eligible words', async () => {
    mockRpc({
      data: [
        {
          word_id: 'word-1',
          word: 'Hello',
          definition: 'A greeting.',
          storage_path: 'hello/standard.mp4',
          format: 'mp4',
        },
      ],
      error: null,
    })
    mockPublicUrl('https://example.test/hello.mp4')

    const { result } = renderHook(() => useTenCardsRound('cat-1', 'standard'))

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.cards).toHaveLength(1)
    expect(result.current.empty).toBe(false)
  })

  it('passes is_custom: true for a custom deck', async () => {
    mockRpc({ data: [], error: null })

    const { result } = renderHook(() => useTenCardsRound('deck-1', 'custom'))
    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(supabase.rpc).toHaveBeenCalledWith('get_random_words_for_category', {
      category_id: 'deck-1',
      is_custom: true,
    })
  })
})
