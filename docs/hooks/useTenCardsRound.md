# useTenCardsRound

**Path:** `src/hooks/useTenCardsRound.ts`
**Signature:** `useTenCardsRound(categoryId: string, deckType: DeckType): { cards: Flashcard[]; loading: boolean; error: string | null; empty: boolean }`

**Purpose:** Fetches the whole "10 Cards" round up front for [TenCardsPage](../components/TenCardsPage.md) — up to 10 distinct random words (+ primary sign videos) from the given category or custom deck, via the [`get_random_words_for_category`](../rpc-functions/get_random_words_for_category.md) RPC.

`deckType: DeckType` (`'standard' | 'custom'`, imported from [useRandomFlashcard](./useRandomFlashcard.md) rather than redeclared) selects whether `categoryId` is looked up in `public.categories` or a user-owned `custom_categories` deck.

**Behavior:** On mount (and whenever `categoryId`/`deckType` change), calls `supabase.rpc('get_random_words_for_category', { category_id: categoryId, is_custom: deckType === 'custom' })` and maps every returned row into a `Flashcard` (same shape as [useRandomFlashcard](./useRandomFlashcard.md)'s, including building each `videoUrl` via `supabase.storage.from('sign-videos').getPublicUrl(...)`). If the RPC returns zero rows, `empty` is `true`. Unlike `useRandomFlashcard`, there's no `next()` — the whole round is fetched once, and `TenCardsPage` steps through the returned `cards` array itself via its own `currentIndex` state.

Uses four independent `useState`s rather than `useRandomFlashcard`'s derived-loading trick, since there's no refetch to guard against — `loading`/`error`/`empty`/`cards` are each just set once when the fetch settles, the same straightforward pattern as [useWords](./useWords.md)/[useCategories](./useCategories.md).

**Used by:** [TenCardsPage](../components/TenCardsPage.md).
