import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export interface CustomDeckDetail {
  deckName: string
  isPublic: boolean
  wordIds: string[]
  tagIds: string[]
}

interface CustomDeckDetailState {
  detail: CustomDeckDetail | null
  loading: boolean
  error: string | null
}

/** Fetches a single owned deck's full editable state for the Edit deck modal: name, publish flag, and its current word/tag links. All three reads rely on the existing owner-gated RLS (or is_public read policy) -- no new policy needed. */
export function useCustomDeckDetail(deckId: string): CustomDeckDetailState {
  const [detail, setDetail] = useState<CustomDeckDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    Promise.all([
      supabase.from('custom_decks').select('deck_name, is_public').eq('id', deckId).single(),
      supabase.from('custom_deck_words').select('word_id').eq('custom_deck_id', deckId),
      supabase.from('custom_deck_tags').select('category_id').eq('custom_deck_id', deckId),
    ]).then(([deckResult, wordsResult, tagsResult]) => {
      if (cancelled) return

      const firstError = deckResult.error ?? wordsResult.error ?? tagsResult.error
      if (firstError || !deckResult.data) {
        setError(firstError?.message ?? 'Deck not found')
        setLoading(false)
        return
      }

      setDetail({
        deckName: deckResult.data.deck_name,
        isPublic: deckResult.data.is_public,
        wordIds: wordsResult.data?.map((row) => row.word_id) ?? [],
        tagIds: tagsResult.data?.map((row) => row.category_id) ?? [],
      })
      setLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [deckId])

  return { detail, loading, error }
}
