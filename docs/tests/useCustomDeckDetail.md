# useCustomDeckDetail.test.ts

**Path:** `src/hooks/useCustomDeckDetail.test.ts`
**Tests:** [useCustomDeckDetail](../hooks/useCustomDeckDetail.md)

## Coverage

- Starts in a loading state with a `null` detail.
- Combines the deck row, its word ids, and its tag ids into one `detail` object.
- Sets an error message when the deck fetch fails.

## Notes

Mocks `../lib/supabase`'s `from` via an explicit factory. The mock dispatches on table name: `custom_decks` gets a `select().eq().single()` chain, while `custom_deck_words` and `custom_deck_tags` get a `select().eq()` chain that resolves directly. Uses `renderHook`/`waitFor` from `@testing-library/react`. The RLS behaviour the hook depends on is enforced in Postgres and is not exercised here.
