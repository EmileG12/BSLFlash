import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { DeckType } from './useRandomFlashcard'

interface CategoryInfoState {
  categoryName: string | null
  isVocabulary: boolean
  loading: boolean
}

/**
 * Looks up a single category's display name from `categories` (standard) or
 * `custom_decks` (custom), by id. Custom decks have no `is_vocabulary`
 * column, so they always report `isVocabulary: false`.
 */
export function useCategoryInfo(categoryId: string, deckType: DeckType): CategoryInfoState {
  const { data, isLoading } = useQuery({
    queryKey: ['categoryInfo', categoryId, deckType],
    queryFn: async () => {
      const query =
        deckType === 'custom'
          ? supabase.from('custom_decks').select('deck_name').eq('id', categoryId).maybeSingle()
          : supabase.from('categories').select('category_name, is_vocabulary').eq('id', categoryId).maybeSingle()

      const { data } = await query
      const name =
        deckType === 'custom'
          ? (data as { deck_name?: string } | null)?.deck_name
          : (data as { category_name?: string } | null)?.category_name
      return {
        categoryName: name ?? null,
        isVocabulary: deckType === 'standard' && (data as { is_vocabulary?: boolean } | null)?.is_vocabulary === true,
      }
    },
  })

  return {
    categoryName: data?.categoryName ?? null,
    isVocabulary: data?.isVocabulary ?? false,
    loading: isLoading,
  }
}
