import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export interface Flashcard {
  wordId: string
  word: string
  definition: string
  videoUrl: string
}

/** 'standard' plays a public.categories deck; 'custom' plays a user-owned custom_decks deck (same id space otherwise). */
export type DeckType = 'standard' | 'custom'

interface RandomFlashcardState {
  flashcard: Flashcard | null
  loading: boolean
  error: string | null
  empty: boolean
  next: () => void
}

export function useRandomFlashcard(
  categoryId: string,
  deckType: DeckType,
  subcategoryId?: string | null,
): RandomFlashcardState {
  const { data, isFetching, error, refetch } = useQuery({
    queryKey: ['randomFlashcard', categoryId, deckType, subcategoryId ?? null],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_random_word_for_category', {
        category_id: categoryId,
        is_custom: deckType === 'custom',
        ...(subcategoryId ? { subcategory_id: subcategoryId } : {}),
      })
      if (error) throw new Error(error.message)
      if (!data || data.length === 0) return { flashcard: null, empty: true }

      const row = data[0]
      const { data: publicUrlData } = supabase.storage.from('sign-videos').getPublicUrl(row.storage_path)
      return {
        flashcard: { wordId: row.word_id, word: row.word, definition: row.definition, videoUrl: publicUrlData.publicUrl },
        empty: false,
      }
    },
    // A random draw should only change via next() or a fresh mount, never
    // silently behind the user's back from refocusing the tab mid-round.
    refetchOnWindowFocus: false,
  })

  return {
    flashcard: data?.flashcard ?? null,
    loading: isFetching,
    error: error?.message ?? null,
    empty: data?.empty ?? false,
    next: () => {
      void refetch()
    },
  }
}
