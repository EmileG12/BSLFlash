import { useQuery, useQueryClient } from '@tanstack/react-query'
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

const queryKey = ['customDecks']

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
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []

      const { data, error } = await supabase
        .from('custom_decks')
        .select('id, deck_name')
        .eq('user_id', user.id)
        .order('deck_name')
      if (error) throw new Error(error.message)
      return data
    },
  })

  const setCustomDecks: React.Dispatch<React.SetStateAction<CustomDeck[]>> = (update) => {
    queryClient.setQueryData<CustomDeck[]>(queryKey, (previous) =>
      previous === undefined ? previous : typeof update === 'function' ? update(previous) : update,
    )
  }

  return { customDecks: data ?? [], loading: isLoading, error: error?.message ?? null, setCustomDecks }
}
