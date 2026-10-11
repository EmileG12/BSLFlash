import { renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { supabase } from '../lib/supabase'
import { useAllCategories } from './useAllCategories'

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}))

function mockCategories(result: { data?: unknown; error?: unknown }) {
  vi.mocked(supabase.from).mockReturnValue({
    select: vi.fn().mockReturnValue({ order: vi.fn().mockResolvedValue(result) }),
  } as never)
}

describe('useAllCategories', () => {
  it('starts in a loading state', () => {
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({ order: vi.fn().mockReturnValue(new Promise(() => {})) }),
    } as never)

    const { result } = renderHook(() => useAllCategories())

    expect(result.current.loading).toBe(true)
    expect(result.current.categories).toEqual([])
  })

  it('returns the fetched categories', async () => {
    mockCategories({ data: [{ id: '1', category_name: 'GCSE' }], error: null })

    const { result } = renderHook(() => useAllCategories())

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.categories).toEqual([{ id: '1', category_name: 'GCSE' }])
  })

  it('sets an error message when the fetch fails', async () => {
    mockCategories({ data: null, error: { message: 'network error' } })

    const { result } = renderHook(() => useAllCategories())

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBe('network error')
  })
})
