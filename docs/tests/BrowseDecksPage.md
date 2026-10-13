# BrowseDecksPage.test.tsx

**Path:** `src/pages/BrowseDecksPage.test.tsx`
**Tests:** [BrowseDecksPage](../components/BrowseDecksPage.md)

## Coverage

- Shows an empty state when there are no public decks.
- Renders a deck with its owner and tags.
- Navigates to `/flashcards/custom/:id` when the deck's Play button is clicked.
- Does not navigate when the deck name is clicked.
- Re-fetches with the typed search term.
- Re-fetches with the selected sort.
- Likes a deck and increments its count optimistically.
- Saves a deck to the library and switches the bookmark icon to its filled green state.

## Notes

Mocks `../lib/supabase` with `rpc` (for `get_public_decks` and `get_available_deck_tags`, via the hooks), and `from` (for the like and save writes) via an explicit factory. Renders inside a `MemoryRouter`/`Routes` with a stub `/browse-decks` route. Navigation is asserted by checking the rendered route rather than mocking `useNavigate`, same convention as [NavBar.test.tsx](./NavBar.md). Renders via [renderWithQueryClient](./renderWithQueryClient.md), since the page calls [usePublicDecks](../hooks/usePublicDecks.md) and renders [TagFilterChips](../components/TagFilterChips.md), which calls [useAvailableDeckTags](../hooks/useAvailableDeckTags.md); all three need a `QueryClientProvider` ancestor.

The Play button is queried by its `Play <deck name>` aria-label. The save test asserts the bookmark icon's `fill-current text-success` classes directly, in addition to the `aria-pressed`-driven label change.
