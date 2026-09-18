import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export interface Flashcard {
  wordId: string
  word: string
  definition: string
  videoUrl: string
}

interface RandomFlashcardState {
  flashcard: Flashcard | null
  loading: boolean
  error: string | null
  empty: boolean
  next: () => void
}

interface Result {
  requestKey: string
  flashcard: Flashcard | null
  error: string | null
  empty: boolean
}

export function useRandomFlashcard(categoryId: string): RandomFlashcardState {
  const [refreshKey, setRefreshKey] = useState(0)
  const [result, setResult] = useState<Result | null>(null)

  const requestKey = `${categoryId}:${refreshKey}`
  // Loading is derived, not stored: it's simply "the last completed fetch
  // doesn't match what we're currently asking for" -- so there's no separate
  // reset-to-loading setState call needed when categoryId/refreshKey change.
  const loading = result?.requestKey !== requestKey

  useEffect(() => {
    let cancelled = false

    supabase
      .rpc('get_random_word_for_category', { category_id: categoryId })
      .then(({ data, error }) => {
        if (cancelled) return

        if (error) {
          setResult({ requestKey, flashcard: null, error: error.message, empty: false })
        } else if (!data || data.length === 0) {
          setResult({ requestKey, flashcard: null, error: null, empty: true })
        } else {
          const row = data[0]
          const { data: publicUrlData } = supabase.storage
            .from('sign-videos')
            .getPublicUrl(row.storage_path)

          setResult({
            requestKey,
            flashcard: {
              wordId: row.word_id,
              word: row.word,
              definition: row.definition,
              videoUrl: publicUrlData.publicUrl,
            },
            error: null,
            empty: false,
          })
        }
      })

    return () => {
      cancelled = true
    }
  }, [categoryId, requestKey])

  function next() {
    setRefreshKey((key) => key + 1)
  }

  return {
    flashcard: loading ? null : (result?.flashcard ?? null),
    loading,
    error: loading ? null : (result?.error ?? null),
    empty: loading ? false : (result?.empty ?? false),
    next,
  }
}
