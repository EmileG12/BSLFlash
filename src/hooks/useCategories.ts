import { useEffect, useState } from 'react'
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
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    supabase
      .rpc('get_categories_with_words', { p_is_vocabulary: vocabulary })
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
  }, [vocabulary])

  return { categories, loading, error }
}
