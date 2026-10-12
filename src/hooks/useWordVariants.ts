import { useQuery, useQueryClient } from '@tanstack/react-query'
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
  const queryClient = useQueryClient()
  const queryKey = ['wordVariants', wordId]

  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('signs')
        .select('id, variant_name, region, is_primary, sign_videos(id, storage_path, format, duration_ms, width, height, file_size)')
        .eq('word_id', wordId)
        .order('variant_name')
      if (error) throw new Error(error.message)
      return data
    },
  })

  const setVariants: React.Dispatch<React.SetStateAction<WordVariant[]>> = (update) => {
    queryClient.setQueryData<WordVariant[]>(queryKey, (previous) =>
      previous === undefined ? previous : typeof update === 'function' ? update(previous) : update,
    )
  }

  return { variants: data ?? [], loading: isLoading, error: error?.message ?? null, setVariants }
}
