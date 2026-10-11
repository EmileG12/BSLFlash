# BrowseDecksPage

**Path:** `src/pages/BrowseDecksPage.tsx`
**Route:** `/browse-decks` (authenticated, inside [AppLayout](./AppLayout.md))

**Purpose:** The public deck directory. Lists every published custom deck, with a name search, sort options and tag filters, and lets the user like a deck or add it to their library. Reached via the "Browse Decks" link in [NavBar](./NavBar.md) and [MobileNavSheet](./MobileNavSheet.md).

**Props:** None — all state is local to the page.

**Key behavior:** Search text, selected tag ids and sort are local state, passed into [usePublicDecks](../hooks/usePublicDecks.md), which calls [`get_public_decks`](../rpc-functions/get_public_decks.md) again whenever any of them changes. Sort options are `likes` (default, "Most liked"), `newest` and `name`. The page renders a [TagFilterChips](./TagFilterChips.md) row between the search bar and the list.

Each deck row shows the name, `by <owner>` (falling back to "Anonymous" when the owner has no profile name) and the comma-joined tag names. Clicking the name navigates to `/flashcards/custom/:id`. A published deck plays exactly like the owner's own custom deck, because [`custom_decks_select_public`](../rls-policies/custom_decks/custom_decks_select_public.md) and [`custom_deck_words_select_public`](../rls-policies/custom_deck_words/custom_deck_words_select_public.md) let any authenticated user read it.

**Like and save** are the two row buttons. Both write directly through the supabase client, not through an RPC:

- Like: inserts into [`deck_likes`](../db-schema/deck_likes.md) (`{ custom_deck_id }`; `user_id` defaults to the caller) or deletes the caller's row by `custom_deck_id`.
- Save: inserts into [`saved_decks`](../db-schema/saved_decks.md) or deletes the caller's row by `custom_deck_id`.

Each toggle is applied optimistically through `setDecks` from [usePublicDecks](../hooks/usePublicDecks.md): the button flips and the like count moves by one immediately. If the write returns an error, the page applies the inverse change to the same row. There is no refetch on either path. Both buttons carry `aria-pressed`, and their labels switch between "Like" / "Unlike" and "Add … to My Decks" / "Remove … from My Decks".

Loading shows three skeleton rows. An RPC error shows "Failed to load decks" with the message. An empty result shows "No public decks match your search."

**Depends on:** [usePublicDecks](../hooks/usePublicDecks.md), [TagFilterChips](./TagFilterChips.md), `Card`/`Button`/`Input` from `src/components/ui/`, `lucide-react` (`Bookmark`, `BookmarkCheck`, `CircleAlert`, `Heart`, `Inbox`), `useNavigate` from `react-router-dom`, the `supabase` client.

**Tested by:** [docs/tests/BrowseDecksPage.md](../tests/BrowseDecksPage.md).
