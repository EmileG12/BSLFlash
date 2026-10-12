import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export interface CategoryTag {
  id: string
  category_name: string
}

interface AllCategoriesState {
  categories: CategoryTag[]
  loading: boolean
  error: string | null
}

/**
 * The full public.categories list, for the Edit deck modal's tag picker --
 * unlike useAvailableDeckTags (directory filter, tags-in-use-only) or
 * useCategories (standard deck menus, words-only), tagging a deck should
 * offer every admin-curated category, including one with zero words that
 * exists purely as a deck tag.
 */
export function useAllCategories(): AllCategoriesState {
  const { data, isLoading, error } = useQuery({
    queryKey: ['categories', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase.from('categories').select('id, category_name').order('category_name')
      if (error) throw new Error(error.message)
      return data
    },
  })

  return { categories: data ?? [], loading: isLoading, error: error?.message ?? null }
}
