import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export interface WordOption {
  id: string
  word: string
  definition: string
}

interface WordsState {
  words: WordOption[]
  loading: boolean
  error: string | null
}

export function useWords(): WordsState {
  const { data, isLoading, error } = useQuery({
    queryKey: ['words'],
    queryFn: async () => {
      const { data, error } = await supabase.from('words').select('id, word, definition').order('word')
      if (error) throw new Error(error.message)
      return data
    },
  })

  return { words: data ?? [], loading: isLoading, error: error?.message ?? null }
}
