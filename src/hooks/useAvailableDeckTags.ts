import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export interface DeckTag {
  id: string
  category_name: string
}

interface AvailableDeckTagsState {
  tags: DeckTag[]
  loading: boolean
  error: string | null
}

/** Tags currently in use on at least one public deck, for the Browse directory's filter chips. */
export function useAvailableDeckTags(): AvailableDeckTagsState {
  const [tags, setTags] = useState<DeckTag[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    supabase
      .rpc('get_available_deck_tags')
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) {
          setError(error.message)
        } else {
          setTags(data ?? [])
        }
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  return { tags, loading, error }
}
