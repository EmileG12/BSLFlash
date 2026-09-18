import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export interface Category {
  id: string
  category_name: string
}

interface CategoriesState {
  categories: Category[]
  loading: boolean
  error: string | null
}

export function useCategories(): CategoriesState {
  const [categories, setCategories] = useState<Category[]>([])
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
