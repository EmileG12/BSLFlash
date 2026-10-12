import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { DeckType, Flashcard } from './useRandomFlashcard'

interface TenCardsRoundState {
  cards: Flashcard[]
  loading: boolean
  error: string | null
  empty: boolean
}

export function useTenCardsRound(
  categoryId: string,
  deckType: DeckType,
  subcategoryId?: string | null,
): TenCardsRoundState {
  const { data, isLoading, error } = useQuery({
    queryKey: ['tenCardsRound', categoryId, deckType, subcategoryId ?? null],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_random_words_for_category', {
        category_id: categoryId,
        is_custom: deckType === 'custom',
        ...(subcategoryId ? { subcategory_id: subcategoryId } : {}),
      })
      if (error) throw new Error(error.message)
      if (data.length === 0) return { cards: [], empty: true }

      const cards = data.map((row): Flashcard => {
        const { data: publicUrlData } = supabase.storage.from('sign-videos').getPublicUrl(row.storage_path)
        return { wordId: row.word_id, word: row.word, definition: row.definition, videoUrl: publicUrlData.publicUrl }
      })
      return { cards, empty: false }
    },
    // The round should only change via a fresh mount, never silently behind
    // the user's back from refocusing the tab mid-round.
    refetchOnWindowFocus: false,
  })

  return {
    cards: data?.cards ?? [],
    loading: isLoading,
    error: error?.message ?? null,
    empty: data?.empty ?? false,
  }
}
