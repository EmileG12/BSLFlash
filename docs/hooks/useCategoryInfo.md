# useCategoryInfo

**Path:** `src/hooks/useCategoryInfo.ts`
**Signature:** `useCategoryInfo(categoryId: string, deckType: DeckType): { categoryName: string | null; isVocabulary: boolean; loading: boolean }`

**Purpose:** Looks up a single category's display name and whether it's a vocabulary category, for [ModeSelectPage](../components/ModeSelectPage.md)'s masthead and its decision whether to render [SubCategoryChips](../components/SubCategoryChips.md).

`deckType: DeckType` (`'standard' | 'custom'`, imported from [useRandomFlashcard](./useRandomFlashcard.md) rather than redeclared) selects whether `categoryId` is looked up in `public.categories` or a user-owned `custom_categories` deck, same convention as [useRandomFlashcard](./useRandomFlashcard.md)/[useTenCardsRound](./useTenCardsRound.md).

**Behavior:** For `'standard'`, selects `category_name, is_vocabulary` from `categories`; for `'custom'`, selects just `category_name` from `custom_categories`. Custom decks have no `is_vocabulary` column, so `isVocabulary` always reports `false` for `deckType: 'custom'` regardless of what (if anything) comes back from the query — it isn't read off the response at all in that branch.

Looking up the vocabulary flag here, rather than adding a separate hook/query, rides along on the same round-trip `ModeSelectPage` already made for the display name — before this, the page only needed `categoryName`, so a second query just to check `is_vocabulary` would have doubled its data fetching for no reason.

**Used by:** [ModeSelectPage](../components/ModeSelectPage.md).
