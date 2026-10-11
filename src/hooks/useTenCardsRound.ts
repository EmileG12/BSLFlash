import { useEffect, useState } from 'react'
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
  const [cards, setCards] = useState<Flashcard[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [empty, setEmpty] = useState(false)

  useEffect(() => {
    let cancelled = false

    supabase
      .rpc('get_random_words_for_category', {
        category_id: categoryId,
        is_custom: deckType === 'custom',
        ...(subcategoryId ? { subcategory_id: subcategoryId } : {}),
      })
      .then(({ data, error }) => {
        if (cancelled) return

        if (error) {
          setError(error.message)
        } else if (data.length === 0) {
          setEmpty(true)
        } else {
          const flashcards = data.map((row) => {
            const { data: publicUrlData } = supabase.storage
              .from('sign-videos')
              .getPublicUrl(row.storage_path)

            const flashcard: Flashcard = {
              wordId: row.word_id,
              word: row.word,
              definition: row.definition,
              videoUrl: publicUrlData.publicUrl,
            }
            return flashcard
          })
          setCards(flashcards)
        }

        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [categoryId, deckType, subcategoryId])

  return { cards, loading, error, empty }
}
