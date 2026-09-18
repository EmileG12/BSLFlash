import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export interface WordOption {
  id: string
  word: string
  definition: string
}

interface WordsState {
  words: WordOption[]
  loading: boolean
  error: string | null
}

export function useWords(): WordsState {
  const [words, setWords] = useState<WordOption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    supabase
      .from('words')
      .select('id, word, definition')
      .order('word')
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) {
          setError(error.message)
        } else {
          setWords(data)
        }
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  return { words, loading, error }
}
