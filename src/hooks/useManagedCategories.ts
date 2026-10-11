import { useEffect, useState } from 'react'
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

/** Every category (including disabled ones), for the superadmin Manage Categories page -- unlike useCategories/useAllCategories, which only ever need active categories for end-user browsing/tagging. */
export function useManagedCategories(): ManagedCategoriesState {
  const [categories, setCategories] = useState<ManagedCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    supabase
      .from('categories')
      .select('id, category_name, is_vocabulary, is_active')
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

  return { categories, loading, error, setCategories }
}
