import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export interface Category {
  id: string
  category_name: string
  is_vocabulary: boolean
}

interface CategoriesState {
  categories: Category[]
  loading: boolean
  error: string | null
}

export function useCategories(vocabulary: boolean): CategoriesState {
  const { data, isLoading, error } = useQuery({
    queryKey: ['categories', 'withWords', vocabulary],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_categories_with_words', { p_is_vocabulary: vocabulary })
      if (error) throw new Error(error.message)
      return data
    },
  })

  return { categories: data ?? [], loading: isLoading, error: error?.message ?? null }
}
