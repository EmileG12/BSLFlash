import { waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { supabase } from '../lib/supabase'
import { renderHookWithQueryClient } from '../test/renderHookWithQueryClient'
import { useCustomDeckDetail } from './useCustomDeckDetail'

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}))

function mockDetail({
  deck = { data: { deck_name: 'My Animals', is_public: false }, error: null },
  words = { data: [{ word_id: 'w1' }, { word_id: 'w2' }], error: null },
  tags = { data: [{ category_id: 't1' }], error: null },
}: {
  deck?: { data: unknown; error: unknown }
  words?: { data: unknown; error: unknown }
  tags?: { data: unknown; error: unknown }
} = {}) {
  vi.mocked(supabase.from).mockImplementation(
    (table: string) =>
      ({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue(
            table === 'custom_decks'
              ? { single: vi.fn().mockResolvedValue(deck) }
              : Promise.resolve(table === 'custom_deck_words' ? words : tags),
          ),
        }),
      }) as never,
  )
}

describe('useCustomDeckDetail', () => {
  it('starts in a loading state', () => {
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({ single: vi.fn().mockReturnValue(new Promise(() => {})) }),
      }),
    } as never)

    const { result } = renderHookWithQueryClient(() => useCustomDeckDetail('deck-1'))

    expect(result.current.loading).toBe(true)
    expect(result.current.detail).toBeNull()
  })

  it('combines the deck, words, and tags into one detail object', async () => {
    mockDetail()

    const { result } = renderHookWithQueryClient(() => useCustomDeckDetail('deck-1'))

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.detail).toEqual({
      deckName: 'My Animals',
      isPublic: false,
      wordIds: ['w1', 'w2'],
      tagIds: ['t1'],
    })
  })

  it('sets an error message when the deck fetch fails', async () => {
    mockDetail({ deck: { data: null, error: { message: 'not found' } } })

    const { result } = renderHookWithQueryClient(() => useCustomDeckDetail('deck-1'))

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBe('not found')
  })
})
