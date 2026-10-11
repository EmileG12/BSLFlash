import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export interface SignVideo {
  id: string
  storage_path: string
  format: string
  duration_ms: number
  width: number
  height: number
  file_size: number
}

export interface WordVariant {
  id: string
  variant_name: string
  region: string | null
  is_primary: boolean
  sign_videos: SignVideo[]
}

interface WordVariantsState {
  variants: WordVariant[]
  loading: boolean
  error: string | null
  setVariants: React.Dispatch<React.SetStateAction<WordVariant[]>>
}

/** A word's sign variants, each with its own video pool -- for the superadmin Manage Words edit view. */
export function useWordVariants(wordId: string): WordVariantsState {
  const [variants, setVariants] = useState<WordVariant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    supabase
      .from('signs')
      .select('id, variant_name, region, is_primary, sign_videos(id, storage_path, format, duration_ms, width, height, file_size)')
      .eq('word_id', wordId)
      .order('variant_name')
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) {
          setError(error.message)
        } else {
          setVariants(data)
        }
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [wordId])

  return { variants, loading, error, setVariants }
}
