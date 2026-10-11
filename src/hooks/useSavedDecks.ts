import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export interface SavedDeck {
  id: string
  deck_name: string
  owner_user_id: string
  owner_name: string | null
}

interface SavedDecksState {
  savedDecks: SavedDeck[]
  loading: boolean
  error: string | null
  setSavedDecks: React.Dispatch<React.SetStateAction<SavedDeck[]>>
}

/** Decks the current user has added to their library from the Browse directory. A dormant save (owner has since unpublished) is excluded here automatically -- see get_saved_decks. */
export function useSavedDecks(): SavedDecksState {
  const [savedDecks, setSavedDecks] = useState<SavedDeck[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    supabase
      .rpc('get_saved_decks')
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) {
          setError(error.message)
        } else {
          setSavedDecks(data ?? [])
        }
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  return { savedDecks, loading, error, setSavedDecks }
}
