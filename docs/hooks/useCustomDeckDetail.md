# useCustomDeckDetail

**Path:** `src/hooks/useCustomDeckDetail.ts`
**Signature:** `useCustomDeckDetail(deckId: string): { detail: CustomDeckDetail | null; loading: boolean; error: string | null }` where `CustomDeckDetail` is `{ deckName: string; isPublic: boolean; wordIds: string[]; tagIds: string[] }`.

**Purpose:** Loads one deck's full editable state for [EditDeckModal](../components/EditDeckModal.md): its name, its publish flag, and its current word and tag links.

**Behavior:** On mount, and again whenever `deckId` changes, it issues three reads in parallel with `Promise.all`:

- [`custom_decks`](../db-schema/custom_decks.md): `deck_name, is_public` for `id = deckId`, via `.single()`.
- [`custom_deck_words`](../db-schema/custom_deck_words.md): `word_id` for `custom_deck_id = deckId`.
- [`custom_deck_tags`](../db-schema/custom_deck_tags.md): `category_id` for `custom_deck_id = deckId`.

All three rely on existing RLS (the owner policies, or the `is_public` read policies for a published deck). No new policy was added for this hook. A deck the caller cannot read makes `.single()` fail, so the error surfaces as the PostgREST error message.

If any of the three returns an error, `error` is set to the first one in order: deck, then words, then tags. `detail` stays `null` in that case. On success, `wordIds` and `tagIds` are the row ids, with an empty array if the response data is null. A `cancelled` flag in the effect cleanup discards a response that arrives after unmount or after `deckId` has changed.

**Used by:** [EditDeckModal](../components/EditDeckModal.md).

**Tested by:** [docs/tests/useCustomDeckDetail.md](../tests/useCustomDeckDetail.md).
