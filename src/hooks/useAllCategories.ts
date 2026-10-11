import { useEffect, useState } from 'react'
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
  const [categories, setCategories] = useState<CategoryTag[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    supabase
      .from('categories')
      .select('id, category_name')
      .order('category_name')
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) {
          setError(error.message)
        } else {
          setCategories(data)
        }
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  return { categories, loading, error }
}
