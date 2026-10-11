import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'

export type DeckSort = 'likes' | 'newest' | 'name'

export interface PublicDeck {
  id: string
  deck_name: string
  owner_user_id: string
  owner_name: string | null
  tag_names: string[]
  like_count: number
  liked_by_me: boolean
  saved_by_me: boolean
  created_at: string
}

interface PublicDecksState {
  decks: PublicDeck[]
  loading: boolean
  error: string | null
  /** Lets the page apply an optimistic like/save toggle without waiting on a refetch. */
  setDecks: React.Dispatch<React.SetStateAction<PublicDeck[]>>
}

interface Result {
  requestKey: string
  decks: PublicDeck[]
  error: string | null
}

/** Backs the Browse decks directory: search by name, AND-filter by tag ids, sorted per get_public_decks. */
export function usePublicDecks(search: string, tagIds: string[], sort: DeckSort): PublicDecksState {
  const [result, setResult] = useState<Result | null>(null)
  const trimmedSearch = search.trim()
  const tagIdsKey = tagIds.join(',')
  const requestKey = `${trimmedSearch}\u0000${tagIdsKey}\u0000${sort}`
  // Loading is derived, not stored -- same pattern as useRandomFlashcard: it's
  // just "the last completed fetch doesn't match what's currently asked for".
  const loading = result?.requestKey !== requestKey

  useEffect(() => {
    let cancelled = false

    supabase
      .rpc('get_public_decks', {
        p_search: trimmedSearch === '' ? undefined : trimmedSearch,
        p_tag_ids: tagIdsKey === '' ? undefined : tagIdsKey.split(','),
        p_sort: sort,
      })
      .then(({ data, error }) => {
        if (cancelled) return
        setResult({ requestKey, decks: data ?? [], error: error?.message ?? null })
      })

    return () => {
      cancelled = true
    }
  }, [trimmedSearch, tagIdsKey, sort, requestKey])

  const decks = useMemo(() => (loading ? [] : result?.decks ?? []), [loading, result])

  function setDecks(update: React.SetStateAction<PublicDeck[]>) {
    setResult((previous) =>
      previous
        ? {
            ...previous,
            decks: typeof update === 'function' ? update(previous.decks) : update,
          }
        : previous,
    )
  }

  return {
    decks,
    loading,
    error: loading ? null : (result?.error ?? null),
    setDecks,
  }
}
