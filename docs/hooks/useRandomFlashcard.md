# useRandomFlashcard

**Path:** `src/hooks/useRandomFlashcard.ts`
**Signature:** `useRandomFlashcard(categoryId: string, deckType: DeckType, subcategoryId?: string | null): { flashcard: Flashcard | null; loading: boolean; error: string | null; empty: boolean; next: () => void }`

**Purpose:** Drives one round of the flashcard game for [FlashcardPage](../components/FlashcardPage.md) — fetches a random word (+ its primary sign video) from the given category or custom deck via the [`get_random_word_for_category`](../rpc-functions/get_random_word_for_category.md) RPC, and exposes `next()` to draw another.

`DeckType = 'standard' | 'custom'` is exported from this file (re-exported by [useTenCardsRound](./useTenCardsRound.md) rather than redeclared): `'standard'` plays a `public.categories` deck; `'custom'` plays a user-owned `custom_decks` deck (same id space otherwise), including a published deck owned by another user. This type is also what the URL's `:deckType` route segment is validated against in [FlashcardPage](../components/FlashcardPage.md)/[TenCardsPage](../components/TenCardsPage.md)/[ModeSelectPage](../components/ModeSelectPage.md).

`subcategoryId` further narrows the word pool to one topic category within a vocabulary category (see [SubCategoryChips](../components/SubCategoryChips.md)); omitted or `null`/`''`, it's left out of the RPC call entirely (via a conditional spread) rather than passed as `null`, so existing call sites that never set it send exactly what they sent before this parameter existed.

**Behavior:** Backed by React Query's `useQuery` under query key `['randomFlashcard', categoryId, deckType, subcategoryId ?? null]`. The `queryFn` calls `supabase.rpc('get_random_word_for_category', { category_id: categoryId, is_custom: deckType === 'custom', ...(subcategoryId ? { subcategory_id: subcategoryId } : {}) })`. If it returns zero rows, `empty` is `true` (the category/deck has no eligible words — see the RPC's own doc for what "eligible" means). Otherwise `flashcard.videoUrl` is built from the returned `storage_path` via `supabase.storage.from('sign-videos').getPublicUrl(...)`. Requires a `QueryClientProvider` ancestor (wired once in `main.tsx`).

**`next()`** calls React Query's `refetch()`. That re-runs the same `queryFn`, so the RPC draws a new random word, and the cached result is replaced.

**`loading`** is `isFetching`, not `isLoading`. `isLoading` is only true for a fetch with no cached data, so it would be `false` during a `next()` refetch, when the previous card is still in `data`. `isFetching` stays true for any in-flight request, so the card shows its loading state while the next word is drawn. Changing `subcategoryId` (or `categoryId`/`deckType`) is a different query key, so it refetches the same way.

A remount (same `categoryId`/`deckType`/`subcategoryId`, since `staleTime` isn't overridden) still draws a fresh word, matching the pre-migration "always fetch on mount" behavior. `refetchOnWindowFocus: false` opts out of React Query's default window-focus refetch specifically, so refocusing the tab mid-round can't silently swap the displayed word without `next()` being called.

**Used by:** [FlashcardPage](../components/FlashcardPage.md).

**Tested by:** [docs/tests/useRandomFlashcard.md](../tests/useRandomFlashcard.md).
