# useRandomFlashcard

**Path:** `src/hooks/useRandomFlashcard.ts`
**Signature:** `useRandomFlashcard(categoryId: string): { flashcard: Flashcard | null; loading: boolean; error: string | null; empty: boolean; next: () => void }`

**Purpose:** Drives one round of the flashcard game for [FlashcardPage](../components/FlashcardPage.md) — fetches a random word (+ its primary sign video) from the given category via the [`get_random_word_for_category`](../rpc-functions/get_random_word_for_category.md) RPC, and exposes `next()` to draw another.

**Behavior:** Calls `supabase.rpc('get_random_word_for_category', { category_id: categoryId })`. If it returns zero rows, `empty` is `true` (the category has no eligible words — see the RPC's own doc for what "eligible" means). Otherwise builds `flashcard.videoUrl` from the returned `storage_path` via `supabase.storage.from('sign-videos').getPublicUrl(...)`.

`loading` is *derived*, not stored as its own piece of state: internally, each fetch is tagged with a `requestKey` (`` `${categoryId}:${refreshKey}` ``), and `loading` is simply `true` whenever the most recently *completed* result's key doesn't match the current one. Calling `next()` only bumps an internal `refreshKey` counter — changing `requestKey` and thus re-triggering the fetch `useEffect` — rather than synchronously resetting state itself. This sidesteps calling `setState` synchronously inside the effect body (flagged by this project's `react-hooks/set-state-in-effect` lint rule) by never needing an explicit "reset to loading" step at all.

**Used by:** [FlashcardPage](../components/FlashcardPage.md).
