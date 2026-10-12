import { act, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { supabase } from '../lib/supabase'
import { renderHookWithQueryClient } from '../test/renderHookWithQueryClient'
import { useManagedCategories } from './useManagedCategories'

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

describe('useManagedCategories', () => {
  it('starts in a loading state', () => {
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({ order: vi.fn().mockReturnValue(new Promise(() => {})) }),
    } as never)

    const { result } = renderHookWithQueryClient(() => useManagedCategories())

    expect(result.current.loading).toBe(true)
    expect(result.current.categories).toEqual([])
  })

  it('returns every category, including disabled ones', async () => {
    mockCategories({
      data: [
        { id: '1', category_name: 'GCSE', is_vocabulary: true, is_active: true },
        { id: '2', category_name: 'Retired', is_vocabulary: false, is_active: false },
      ],
      error: null,
    })

    const { result } = renderHookWithQueryClient(() => useManagedCategories())

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.categories).toEqual([
      { id: '1', category_name: 'GCSE', is_vocabulary: true, is_active: true },
      { id: '2', category_name: 'Retired', is_vocabulary: false, is_active: false },
    ])
  })

  it('sets an error message when the fetch fails', async () => {
    mockCategories({ data: null, error: { message: 'network error' } })

    const { result } = renderHookWithQueryClient(() => useManagedCategories())

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBe('network error')
  })

  it('setCategories lets the caller apply a local update', async () => {
    mockCategories({
      data: [{ id: '1', category_name: 'GCSE', is_vocabulary: true, is_active: true }],
      error: null,
    })

    const { result } = renderHookWithQueryClient(() => useManagedCategories())
    await waitFor(() => expect(result.current.loading).toBe(false))

    act(() => {
      result.current.setCategories((previous) =>
        previous.map((category) => (category.id === '1' ? { ...category, is_active: false } : category)),
      )
    })

    await waitFor(() => expect(result.current.categories[0].is_active).toBe(false))
  })
})
