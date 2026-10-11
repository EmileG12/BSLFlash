import { renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { supabase } from '../lib/supabase'
import { useAvailableDeckTags } from './useAvailableDeckTags'

vi.mock('../lib/supabase', () => ({
  supabase: {
    rpc: vi.fn(),
  },
}))

describe('useAvailableDeckTags', () => {
  it('starts in a loading state', () => {
    vi.mocked(supabase.rpc).mockReturnValue(new Promise(() => {}) as never)

    const { result } = renderHook(() => useAvailableDeckTags())

    expect(result.current.loading).toBe(true)
    expect(result.current.tags).toEqual([])
  })

  it('returns the fetched tags', async () => {
    vi.mocked(supabase.rpc).mockResolvedValue({
      data: [{ id: '1', category_name: 'GCSE' }],
      error: null,
    } as never)

    const { result } = renderHook(() => useAvailableDeckTags())

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.tags).toEqual([{ id: '1', category_name: 'GCSE' }])
  })

  it('sets an error message when the fetch fails', async () => {
    vi.mocked(supabase.rpc).mockResolvedValue({
      data: null,
      error: { message: 'network error' },
    } as never)

    const { result } = renderHook(() => useAvailableDeckTags())

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBe('network error')
  })
})
