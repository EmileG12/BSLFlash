import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export interface ManagedCategory {
  id: string
  category_name: string
  is_vocabulary: boolean
  is_active: boolean
}

interface ManagedCategoriesState {
  categories: ManagedCategory[]
  loading: boolean
  error: string | null
  setCategories: React.Dispatch<React.SetStateAction<ManagedCategory[]>>
}

const queryKey = ['categories', 'managed']

/** Every category (including disabled ones), for the superadmin Manage Categories page -- unlike useCategories/useAllCategories, which only ever need active categories for end-user browsing/tagging. */
export function useManagedCategories(): ManagedCategoriesState {
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('id, category_name, is_vocabulary, is_active')
        .order('category_name')
      if (error) throw new Error(error.message)
      return data
    },
  })

  const setCategories: React.Dispatch<React.SetStateAction<ManagedCategory[]>> = (update) => {
    queryClient.setQueryData<ManagedCategory[]>(queryKey, (previous) =>
      previous === undefined ? previous : typeof update === 'function' ? update(previous) : update,
    )
  }

  return { categories: data ?? [], loading: isLoading, error: error?.message ?? null, setCategories }
}
