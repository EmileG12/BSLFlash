import { useQuery, useQueryClient } from '@tanstack/react-query'
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

const queryKey = ['savedDecks']

/** Decks the current user has added to their library from the Browse directory. A dormant save (owner has since unpublished) is excluded here automatically -- see get_saved_decks. */
export function useSavedDecks(): SavedDecksState {
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_saved_decks')
      if (error) throw new Error(error.message)
      return data ?? []
    },
  })

  const setSavedDecks: React.Dispatch<React.SetStateAction<SavedDeck[]>> = (update) => {
    queryClient.setQueryData<SavedDeck[]>(queryKey, (previous) =>
      previous === undefined ? previous : typeof update === 'function' ? update(previous) : update,
    )
  }

  return { savedDecks: data ?? [], loading: isLoading, error: error?.message ?? null, setSavedDecks }
}
