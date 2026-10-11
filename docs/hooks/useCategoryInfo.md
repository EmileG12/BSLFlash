# useCategoryInfo

**Path:** `src/hooks/useCategoryInfo.ts`
**Signature:** `useCategoryInfo(categoryId: string, deckType: DeckType): { categoryName: string | null; isVocabulary: boolean; loading: boolean }`

**Purpose:** Looks up a single category's display name and whether it's a vocabulary category, for [ModeSelectPage](../components/ModeSelectPage.md)'s masthead and its decision whether to render [SubCategoryChips](../components/SubCategoryChips.md).

`deckType: DeckType` (`'standard' | 'custom'`, imported from [useRandomFlashcard](./useRandomFlashcard.md) rather than redeclared) selects whether `categoryId` is looked up in `public.categories` or a user-owned `custom_decks` deck, same convention as [useRandomFlashcard](./useRandomFlashcard.md)/[useTenCardsRound](./useTenCardsRound.md).

**Behavior:** For `'standard'`, selects `category_name, is_vocabulary` from `categories`; for `'custom'`, selects just `deck_name` from `custom_decks`. Custom decks have no `is_vocabulary` column, so `isVocabulary` always reports `false` for `deckType: 'custom'` regardless of what (if anything) comes back from the query — it isn't read off the response at all in that branch.

This hook and the category-name display it powers are both new as of the subcategory-filtering feature — `ModeSelectPage` previously had a static title with no category lookup at all. The vocabulary flag is folded into this one hook's query rather than split into a second hook/query, so showing the name and deciding whether to render [SubCategoryChips](../components/SubCategoryChips.md) only ever costs one round-trip, not two.

**Used by:** [ModeSelectPage](../components/ModeSelectPage.md).
