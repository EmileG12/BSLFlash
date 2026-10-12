# useTenCardsRound

**Path:** `src/hooks/useTenCardsRound.ts`
**Signature:** `useTenCardsRound(categoryId: string, deckType: DeckType, subcategoryId?: string | null): { cards: Flashcard[]; loading: boolean; error: string | null; empty: boolean }`

**Purpose:** Fetches the whole "10 Cards" round up front for [TenCardsPage](../components/TenCardsPage.md) — up to 10 distinct random words (+ primary sign videos) from the given category or custom deck, via the [`get_random_words_for_category`](../rpc-functions/get_random_words_for_category.md) RPC.

`deckType: DeckType` (`'standard' | 'custom'`, imported from [useRandomFlashcard](./useRandomFlashcard.md) rather than redeclared) selects whether `categoryId` is looked up in `public.categories` or a user-owned `custom_decks` deck.

`subcategoryId`, same convention as [useRandomFlashcard](./useRandomFlashcard.md)'s, further narrows the pool to one topic category within a vocabulary category; omitted or `null`/`''`, it's left out of the RPC call entirely via a conditional spread.

**Behavior:** Backed by React Query's `useQuery` under query key `['tenCardsRound', categoryId, deckType, subcategoryId ?? null]`. The `queryFn` calls `supabase.rpc('get_random_words_for_category', { category_id: categoryId, is_custom: deckType === 'custom', ...(subcategoryId ? { subcategory_id: subcategoryId } : {}) })` and maps every returned row into a `Flashcard` (same shape as [useRandomFlashcard](./useRandomFlashcard.md)'s, including building each `videoUrl` via `supabase.storage.from('sign-videos').getPublicUrl(...)`). If the RPC returns zero rows, `empty` is `true`. `cards`, `loading`, `error` and `empty` are all derived from the query result.

Unlike `useRandomFlashcard`, there's no `next()` — the whole round is fetched once, and `TenCardsPage` steps through the returned `cards` array itself via its own `currentIndex` state. `refetchOnWindowFocus: false` opts out of React Query's default window-focus refetch, so refocusing the tab mid-round can't silently replace the round. A remount (same query key, since `staleTime` isn't overridden) still fetches a fresh round. Requires a `QueryClientProvider` ancestor (wired once in `main.tsx`).

**Used by:** [TenCardsPage](../components/TenCardsPage.md).

**Tested by:** [docs/tests/useTenCardsRound.md](../tests/useTenCardsRound.md).
