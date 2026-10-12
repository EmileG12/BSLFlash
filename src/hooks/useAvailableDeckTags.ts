import { useQuery } from '@tanstack/react-query'
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
  const { data, isLoading, error } = useQuery({
    queryKey: ['availableDeckTags'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_available_deck_tags')
      if (error) throw new Error(error.message)
      return data ?? []
    },
  })

  return { tags: data ?? [], loading: isLoading, error: error?.message ?? null }
}
