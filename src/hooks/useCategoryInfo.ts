import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { DeckType } from './useRandomFlashcard'

interface CategoryInfoState {
  categoryName: string | null
  isVocabulary: boolean
  loading: boolean
}

/**
 * Looks up a single category's display name from `categories` (standard) or
 * `custom_categories` (custom), by id. Custom decks have no `is_vocabulary`
 * column, so they always report `isVocabulary: false`.
 */
export function useCategoryInfo(categoryId: string, deckType: DeckType): CategoryInfoState {
  const [categoryName, setCategoryName] = useState<string | null>(null)
  const [isVocabulary, setIsVocabulary] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    const query =
      deckType === 'custom'
        ? supabase.from('custom_categories').select('category_name').eq('id', categoryId).maybeSingle()
        : supabase.from('categories').select('category_name, is_vocabulary').eq('id', categoryId).maybeSingle()

    query.then(({ data }) => {
      if (cancelled) return
      setCategoryName(data?.category_name ?? null)
      setIsVocabulary(deckType === 'standard' && (data as { is_vocabulary?: boolean } | null)?.is_vocabulary === true)
      setLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [categoryId, deckType])

  return { categoryName, isVocabulary, loading }
}
