# BrowseDecksPage

**Path:** `src/pages/BrowseDecksPage.tsx`
**Route:** `/browse-decks` (authenticated, inside [AppLayout](./AppLayout.md))

**Purpose:** The public deck directory. Lists every published custom deck, with a name search, sort options and tag filters, and lets the user play a deck, like it, or add it to their library. Reached via the "Browse Decks" link in [NavBar](./NavBar.md) and [MobileNavSheet](./MobileNavSheet.md).

**Props:** None — all state is local to the page.

**Key behavior:** Search text, selected tag ids and sort are local state, passed into [usePublicDecks](../hooks/usePublicDecks.md), which calls [`get_public_decks`](../rpc-functions/get_public_decks.md) again whenever any of them changes. Sort options are `likes` (default, "Most liked"), `newest` and `name`. The page renders a [TagFilterChips](./TagFilterChips.md) row between the search bar and the list.

Each deck row shows the name, `by <owner>` (falling back to "Anonymous" when the owner has no profile name) and the comma-joined tag names. The name block is plain, non-interactive text, so clicking it does nothing. Navigation to `/flashcards/custom/:id` (mode selection) happens only from the **Play** button, because users were accidentally opening mode selection by clicking what looked like a static list row. A published deck plays exactly like the owner's own custom deck, because [`custom_decks_select_public`](../rls-policies/custom_decks/custom_decks_select_public.md) and [`custom_deck_words_select_public`](../rls-policies/custom_deck_words/custom_deck_words_select_public.md) let any authenticated user read it.

**Play** is a `Button` with the `lucide-react` `Play` icon, visible label "Play", and `aria-label` `Play <deck name>`. It keeps `variant="default"` but overrides the fill with `bg-brand-emphasis text-brand-contrast hover:bg-brand-emphasis-strong`, so the row's most important action is visually set apart from routine actions elsewhere in the app that use the default button style.

**Like and save** are the two toggle buttons after Play. Both write directly through the supabase client, not through an RPC:

- Like: inserts into [`deck_likes`](../db-schema/deck_likes.md) (`{ custom_deck_id }`; `user_id` defaults to the caller) or deletes the caller's row by `custom_deck_id`.
- Save: inserts into [`saved_decks`](../db-schema/saved_decks.md) or deletes the caller's row by `custom_deck_id`.

Each toggle is applied optimistically through `setDecks` from [usePublicDecks](../hooks/usePublicDecks.md): the button flips and the like count moves by one immediately. If the write returns an error, the page applies the inverse change to the same row. There is no refetch on either path. Both buttons carry `aria-pressed`, and their labels switch between "Like" / "Unlike" and "Add … to My Decks" / "Remove … from My Decks".

Active state is shown by filling the icon in place rather than swapping glyphs. Like fills its `Heart` with `fill-current text-destructive`. Save uses a single `Bookmark` icon that gets `fill-current text-success` when saved (unsaved is an outline). The two toggles deliberately share this convention, so the pair does not present two different active-state visual languages side by side in the same row.

Loading shows three skeleton rows. An RPC error shows "Failed to load decks" with the message. An empty result shows "No public decks match your search."

**Depends on:** [usePublicDecks](../hooks/usePublicDecks.md), [TagFilterChips](./TagFilterChips.md), `Card`/`Button`/`Input` from `src/components/ui/`, `lucide-react` (`Bookmark`, `CircleAlert`, `Heart`, `Inbox`, `Play`), `useNavigate` from `react-router-dom`, the `supabase` client.

**Tested by:** [docs/tests/BrowseDecksPage.md](../tests/BrowseDecksPage.md).
