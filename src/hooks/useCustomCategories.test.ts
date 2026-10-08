import { renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { supabase } from '../lib/supabase'
import { useCustomCategories } from './useCustomCategories'

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}))

function mockCustomCategories(result: { data?: unknown; error?: unknown }) {
  vi.mocked(supabase.from).mockReturnValue({
    select: vi.fn().mockReturnValue({
      order: vi.fn().mockResolvedValue(result),
    }),
  } as never)
}

describe('useCustomCategories', () => {
  it('starts in a loading state', () => {
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockReturnValue(new Promise(() => {})),
      }),
    } as never)

    const { result } = renderHook(() => useCustomCategories())

    expect(result.current.loading).toBe(true)
    expect(result.current.customCategories).toEqual([])
  })

  it('returns the fetched custom categories', async () => {
    mockCustomCategories({
      data: [{ id: '1', category_name: 'My Animals' }],
      error: null,
    })

    const { result } = renderHook(() => useCustomCategories())

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.customCategories).toEqual([{ id: '1', category_name: 'My Animals' }])
  })

  it('sets an error message when the fetch fails', async () => {
    mockCustomCategories({ data: null, error: { message: 'network error' } })

    const { result } = renderHook(() => useCustomCategories())

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBe('network error')
  })

  it('returns an empty list when the user has no custom decks', async () => {
    mockCustomCategories({ data: [], error: null })

    const { result } = renderHook(() => useCustomCategories())

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.customCategories).toEqual([])
  })
})
