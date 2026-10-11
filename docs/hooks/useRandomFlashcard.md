# useRandomFlashcard

**Path:** `src/hooks/useRandomFlashcard.ts`
**Signature:** `useRandomFlashcard(categoryId: string, deckType: DeckType, subcategoryId?: string | null): { flashcard: Flashcard | null; loading: boolean; error: string | null; empty: boolean; next: () => void }`

**Purpose:** Drives one round of the flashcard game for [FlashcardPage](../components/FlashcardPage.md) — fetches a random word (+ its primary sign video) from the given category or custom deck via the [`get_random_word_for_category`](../rpc-functions/get_random_word_for_category.md) RPC, and exposes `next()` to draw another.

`DeckType = 'standard' | 'custom'` is exported from this file (re-exported by [useTenCardsRound](./useTenCardsRound.md) rather than redeclared): `'standard'` plays a `public.categories` deck; `'custom'` plays a user-owned `custom_categories` deck (same id space otherwise). This type is also what the URL's `:deckType` route segment is validated against in [FlashcardPage](../components/FlashcardPage.md)/[TenCardsPage](../components/TenCardsPage.md)/[ModeSelectPage](../components/ModeSelectPage.md).

`subcategoryId` further narrows the word pool to one topic category within a vocabulary category (see [SubCategoryChips](../components/SubCategoryChips.md)); omitted or `null`/`''`, it's left out of the RPC call entirely (via a conditional spread) rather than passed as `null`, so existing call sites that never set it send exactly what they sent before this parameter existed.

**Behavior:** Calls `supabase.rpc('get_random_word_for_category', { category_id: categoryId, is_custom: deckType === 'custom', ...(subcategoryId ? { subcategory_id: subcategoryId } : {}) })`. If it returns zero rows, `empty` is `true` (the category/deck has no eligible words — see the RPC's own doc for what "eligible" means). Otherwise builds `flashcard.videoUrl` from the returned `storage_path` via `supabase.storage.from('sign-videos').getPublicUrl(...)`.

`loading` is *derived*, not stored as its own piece of state: internally, each fetch is tagged with a `requestKey` (`` `${deckType}:${categoryId}:${subcategoryId ?? ''}:${refreshKey}` ``), and `loading` is simply `true` whenever the most recently *completed* result's key doesn't match the current one. Calling `next()` only bumps an internal `refreshKey` counter — changing `requestKey` and thus re-triggering the fetch `useEffect` — rather than synchronously resetting state itself. This sidesteps calling `setState` synchronously inside the effect body (flagged by this project's `react-hooks/set-state-in-effect` lint rule) by never needing an explicit "reset to loading" step at all. `subcategoryId` is part of both `requestKey` and the effect's dependency array, so changing it (e.g. picking a different chip) refetches the same way changing `categoryId` does.

**Used by:** [FlashcardPage](../components/FlashcardPage.md).
