import { waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { supabase } from '../lib/supabase'
import { renderHookWithQueryClient } from '../test/renderHookWithQueryClient'
import { useWords } from './useWords'

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}))

function mockWords(result: { data?: unknown; error?: unknown }) {
  vi.mocked(supabase.from).mockReturnValue({
    select: vi.fn().mockReturnValue({
      order: vi.fn().mockResolvedValue(result),
    }),
  } as never)
}

describe('useWords', () => {
  it('starts in a loading state', () => {
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockReturnValue(new Promise(() => {})),
      }),
    } as never)

    const { result } = renderHookWithQueryClient(() => useWords())

    expect(result.current.loading).toBe(true)
    expect(result.current.words).toEqual([])
  })

  it('returns the fetched words', async () => {
    mockWords({
      data: [{ id: '1', word: 'Hello', definition: 'A greeting.' }],
      error: null,
    })

    const { result } = renderHookWithQueryClient(() => useWords())

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.words).toEqual([{ id: '1', word: 'Hello', definition: 'A greeting.' }])
  })

  it('sets an error message when the fetch fails', async () => {
    mockWords({ data: null, error: { message: 'network error' } })

    const { result } = renderHookWithQueryClient(() => useWords())

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBe('network error')
  })

  it('returns an empty list when there are no words', async () => {
    mockWords({ data: [], error: null })

    const { result } = renderHookWithQueryClient(() => useWords())

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.words).toEqual([])
  })
})
