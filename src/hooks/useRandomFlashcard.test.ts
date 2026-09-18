import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { supabase } from '../lib/supabase'
import { useRandomFlashcard } from './useRandomFlashcard'

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

describe('useRandomFlashcard', () => {
  it('starts in a loading state', () => {
    vi.mocked(supabase.rpc).mockReturnValue(new Promise(() => {}) as never)

    const { result } = renderHook(() => useRandomFlashcard('cat-1'))

    expect(result.current.loading).toBe(true)
    expect(result.current.flashcard).toBeNull()
  })

  it('returns the flashcard with a built video URL', async () => {
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
    mockPublicUrl('https://example.test/storage/v1/object/public/sign-videos/hello/standard.mp4')

    const { result } = renderHook(() => useRandomFlashcard('cat-1'))

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.flashcard).toEqual({
      wordId: 'word-1',
      word: 'Hello',
      definition: 'A greeting.',
      videoUrl: 'https://example.test/storage/v1/object/public/sign-videos/hello/standard.mp4',
    })
  })

  it('sets empty when the category has no eligible words', async () => {
    mockRpc({ data: [], error: null })

    const { result } = renderHook(() => useRandomFlashcard('cat-1'))

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.empty).toBe(true)
    expect(result.current.flashcard).toBeNull()
  })

  it('sets an error message when the RPC call fails', async () => {
    mockRpc({ data: null, error: { message: 'boom' } })

    const { result } = renderHook(() => useRandomFlashcard('cat-1'))

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBe('boom')
  })

  it('next() draws a new word by re-calling the RPC', async () => {
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

    const { result } = renderHook(() => useRandomFlashcard('cat-1'))
    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(supabase.rpc).toHaveBeenCalledTimes(1)

    act(() => {
      result.current.next()
    })

    expect(result.current.loading).toBe(true)
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(supabase.rpc).toHaveBeenCalledTimes(2)
  })
})
