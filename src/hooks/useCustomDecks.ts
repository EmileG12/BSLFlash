import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export interface CustomDeck {
  id: string
  deck_name: string
}

interface CustomDecksState {
  customDecks: CustomDeck[]
  loading: boolean
  error: string | null
  setCustomDecks: React.Dispatch<React.SetStateAction<CustomDeck[]>>
}

/**
 * Lists only the caller's OWN custom decks for "My Decks". An explicit
 * user_id filter is required here, not just RLS: custom_decks now also has
 * a select_public policy (any public deck, from any owner), so relying on
 * RLS alone would let someone else's published deck show up in "My Decks"
 * too. The owner-only custom_decks_select_own/update_own/delete_own
 * policies still apply underneath this filter as the real security
 * boundary -- this .eq() is a display-scope narrowing, not the only thing
 * standing between a user and someone else's deck.
 */
export function useCustomDecks(): CustomDecksState {
  const [customDecks, setCustomDecks] = useState<CustomDeck[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (cancelled) return
      if (!user) {
        setCustomDecks([])
        setLoading(false)
        return
      }

      supabase
        .from('custom_decks')
        .select('id, deck_name')
        .eq('user_id', user.id)
        .order('deck_name')
        .then(({ data, error }) => {
          if (cancelled) return
          if (error) {
            setError(error.message)
          } else {
            setCustomDecks(data)
          }
          setLoading(false)
        })
    })

    return () => {
      cancelled = true
    }
  }, [])

  return { customDecks, loading, error, setCustomDecks }
}
