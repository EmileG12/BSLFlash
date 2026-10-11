import { renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { supabase } from '../lib/supabase'
import { useCategoryInfo } from './useCategoryInfo'

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}))

function mockFrom(data: unknown) {
  vi.mocked(supabase.from).mockReturnValue({
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        maybeSingle: vi.fn().mockResolvedValue({ data, error: null }),
      }),
    }),
  } as never)
}

describe('useCategoryInfo', () => {
  it('reports isVocabulary: true for a standard vocabulary category', async () => {
    mockFrom({ category_name: 'GCSE', is_vocabulary: true })

    const { result } = renderHook(() => useCategoryInfo('cat-1', 'standard'))

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.categoryName).toBe('GCSE')
    expect(result.current.isVocabulary).toBe(true)
    expect(supabase.from).toHaveBeenCalledWith('categories')
  })

  it('reports isVocabulary: false for a standard topic category', async () => {
    mockFrom({ category_name: 'Colours', is_vocabulary: false })

    const { result } = renderHook(() => useCategoryInfo('cat-1', 'standard'))

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.isVocabulary).toBe(false)
  })

  it('always reports isVocabulary: false for a custom deck', async () => {
    mockFrom({ category_name: 'My Deck' })

    const { result } = renderHook(() => useCategoryInfo('deck-1', 'custom'))

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.categoryName).toBe('My Deck')
    expect(result.current.isVocabulary).toBe(false)
    expect(supabase.from).toHaveBeenCalledWith('custom_categories')
  })
})
