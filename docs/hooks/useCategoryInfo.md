# useCategoryInfo

**Path:** `src/hooks/useCategoryInfo.ts`
**Signature:** `useCategoryInfo(categoryId: string, deckType: DeckType): { categoryName: string | null; isVocabulary: boolean; loading: boolean }`

**Purpose:** Looks up a single category's display name and whether it's a vocabulary category, for [ModeSelectPage](../components/ModeSelectPage.md)'s masthead and its decision whether to render [SubCategoryChips](../components/SubCategoryChips.md).

`deckType: DeckType` (`'standard' | 'custom'`, imported from [useRandomFlashcard](./useRandomFlashcard.md) rather than redeclared) selects whether `categoryId` is looked up in `public.categories` or a user-owned `custom_decks` deck, same convention as [useRandomFlashcard](./useRandomFlashcard.md)/[useTenCardsRound](./useTenCardsRound.md).

**Behavior:** Backed by React Query's `useQuery` under query key `['categoryInfo', categoryId, deckType]`. For `'standard'`, the `queryFn` selects `category_name, is_vocabulary` from `categories`; for `'custom'`, it selects just `deck_name` from `custom_decks`. Both use `.eq('id', categoryId).maybeSingle()`. `loading` is `isLoading`.

Custom decks have no `is_vocabulary` column, so `isVocabulary` always reports `false` for `deckType: 'custom'` regardless of what (if anything) comes back from the query. It isn't read off the response at all in that branch.

The query's `error` is not read. A failed lookup resolves to `categoryName: null` and `isVocabulary: false`, and the hook has no `error` field.

The vocabulary flag is folded into this one query rather than split into a second hook, so showing the name and deciding whether to render [SubCategoryChips](../components/SubCategoryChips.md) costs one round-trip, not two. Requires a `QueryClientProvider` ancestor (wired once in `main.tsx`).

**Used by:** [ModeSelectPage](../components/ModeSelectPage.md).
