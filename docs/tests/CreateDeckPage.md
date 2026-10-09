# CreateDeckPage.test.tsx

**Path:** `src/pages/CreateDeckPage.test.tsx`
**Tests:** [CreateDeckPage](../components/CreateDeckPage.md)

## Coverage

- Clicking an available word moves it into the selected list.
- Exposes the word catalog and selected-words lists as labelled `role="group"` regions (`aria-label` "Word catalog" / "Selected words").
- Typing in the search box filters the available list.
- Clicking a selected word's remove button returns it to the available list.
- "Confirm" is disabled until at least one word is selected.
- Confirming the naming dialog calls `create_custom_category` with the entered name and selected word ids, then navigates to `/my-decks`.
- Shows the RPC's error message when deck creation fails, without navigating away.

## Notes

Mocks `../lib/supabase`'s `from` (behind [useWords](../hooks/useWords.md)) and `rpc` (the `create_custom_category` call). Renders inside a `MemoryRouter`/`Routes` with a stub `/my-decks` route to assert the post-create navigation against. The naming dialog's own inputs/buttons are queried via `within(screen.getByRole('dialog'))`, since the dialog also has its own "Confirm" button distinct from the page's "Confirm" button that opens it. The running total is asserted via `screen.getByRole('status')` (the page's `aria-live="polite"` span), not by matching its text directly.
