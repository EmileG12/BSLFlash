# useCustomDecks

**Path:** `src/hooks/useCustomDecks.ts`
**Signature:** `useCustomDecks(): { customDecks: CustomDeck[]; loading: boolean; error: string | null; setCustomDecks: React.Dispatch<React.SetStateAction<CustomDeck[]>> }` where `CustomDeck` is `{ id: string; deck_name: string }`.

**Purpose:** Fetches the signed-in user's own custom decks for [MyDecksPage](../components/MyDecksPage.md)'s "My Decks" list, via [DeckGrid](../components/DeckGrid.md). Mirrors [useCategories](./useCategories.md)'s shape and fetch pattern, but queries [`custom_decks`](../db-schema/custom_decks.md) instead of `categories`.

**Behavior:** On mount, calls `supabase.auth.getUser()`. If there is no signed-in user, it sets `customDecks` to `[]` and does not query. Otherwise it runs `supabase.from('custom_decks').select('id, deck_name').eq('user_id', user.id).order('deck_name')`.

The explicit `.eq('user_id', user.id)` is required, not redundant with RLS. [`custom_decks`](../rls-policies/custom_decks/README.md) has a SELECT policy for published decks ([custom_decks_select_public](../rls-policies/custom_decks/custom_decks_select_public.md)) that is additive to the owner policy ([custom_decks_select_own](../rls-policies/custom_decks/custom_decks_select_own.md)). Without the filter, another user's published deck would also appear under "My Decks". RLS still decides what the caller may read; the `.eq` narrows what this list displays.

Sets `loading` to `false` once the request settles, and `error` to the Postgres error message if it fails. Guards against setting state after unmount with a `cancelled` flag.

`setCustomDecks` is returned so [MyDecksPage](../components/MyDecksPage.md) can update a deck's `deck_name` locally after a successful [EditDeckModal](../components/EditDeckModal.md) save, without a refetch. The hook itself never changes the list after mount.

**Used by:** [MyDecksPage](../components/MyDecksPage.md).

**Tested by:** [docs/tests/useCustomDecks.md](../tests/useCustomDecks.md).
