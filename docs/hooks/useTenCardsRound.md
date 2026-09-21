# useTenCardsRound

**Path:** `src/hooks/useTenCardsRound.ts`
**Signature:** `useTenCardsRound(categoryId: string): { cards: Flashcard[]; loading: boolean; error: string | null; empty: boolean }`

**Purpose:** Fetches the whole "10 Cards" round up front for [TenCardsPage](../components/TenCardsPage.md) — up to 10 distinct random words (+ primary sign videos) from the given category, via the [`get_random_words_for_category`](../rpc-functions/get_random_words_for_category.md) RPC.

**Behavior:** On mount (and whenever `categoryId` changes), calls `supabase.rpc('get_random_words_for_category', { category_id: categoryId })` and maps every returned row into a `Flashcard` (same shape as [useRandomFlashcard](./useRandomFlashcard.md)'s, including building each `videoUrl` via `supabase.storage.from('sign-videos').getPublicUrl(...)`). If the RPC returns zero rows, `empty` is `true`. Unlike `useRandomFlashcard`, there's no `next()` — the whole round is fetched once, and `TenCardsPage` steps through the returned `cards` array itself via its own `currentIndex` state.

Uses four independent `useState`s rather than `useRandomFlashcard`'s derived-loading trick, since there's no refetch to guard against — `loading`/`error`/`empty`/`cards` are each just set once when the fetch settles, the same straightforward pattern as [useWords](./useWords.md)/[useCategories](./useCategories.md).

**Used by:** [TenCardsPage](../components/TenCardsPage.md).
