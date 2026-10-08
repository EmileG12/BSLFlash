import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export interface CustomCategory {
  id: string
  category_name: string
}

interface CustomCategoriesState {
  customCategories: CustomCategory[]
  loading: boolean
  error: string | null
}

/** The custom_categories table's RLS already scopes select to the caller's own rows, so no explicit user_id filter is needed here -- same pattern as useCategories. */
export function useCustomCategories(): CustomCategoriesState {
  const [customCategories, setCustomCategories] = useState<CustomCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    supabase
      .from('custom_categories')
      .select('id, category_name')
      .order('category_name')
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) {
          setError(error.message)
        } else {
          setCustomCategories(data)
        }
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  return { customCategories, loading, error }
}
