import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export type DeckSort = 'likes' | 'newest' | 'name'

export interface PublicDeck {
  id: string
  deck_name: string
  owner_user_id: string
  owner_name: string | null
  tag_names: string[]
  like_count: number
  liked_by_me: boolean
  saved_by_me: boolean
  created_at: string
}

interface PublicDecksState {
  decks: PublicDeck[]
  loading: boolean
  error: string | null
  /** Lets the page apply an optimistic like/save toggle without waiting on a refetch. */
  setDecks: React.Dispatch<React.SetStateAction<PublicDeck[]>>
}

/** Backs the Browse decks directory: search by name, AND-filter by tag ids, sorted per get_public_decks. */
export function usePublicDecks(search: string, tagIds: string[], sort: DeckSort): PublicDecksState {
  const queryClient = useQueryClient()
  const trimmedSearch = search.trim()
  const tagIdsKey = tagIds.join(',')
  const queryKey = ['publicDecks', trimmedSearch, tagIdsKey, sort]

  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_public_decks', {
        p_search: trimmedSearch === '' ? undefined : trimmedSearch,
        p_tag_ids: tagIdsKey === '' ? undefined : tagIdsKey.split(','),
        p_sort: sort,
      })
      if (error) throw new Error(error.message)
      return data ?? []
    },
  })

  const setDecks: React.Dispatch<React.SetStateAction<PublicDeck[]>> = (update) => {
    queryClient.setQueryData<PublicDeck[]>(queryKey, (previous) =>
      previous === undefined ? previous : typeof update === 'function' ? update(previous) : update,
    )
  }

  return {
    decks: data ?? [],
    loading: isLoading,
    error: error?.message ?? null,
    setDecks,
  }
}
