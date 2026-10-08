# SelectDeckCard.test.tsx

**Path:** `src/components/SelectDeckCard.test.tsx`
**Tests:** [SelectDeckCard](../components/SelectDeckCard.md)

## Coverage

- Shows a "Loading categories..." message while the fetch is in flight.
- Renders one button per category once the fetch resolves.
- Shows a "Failed to load categories" message when the fetch errors.
- Shows a "No categories yet" message when the fetch resolves with zero rows.
- Passing `vocabulary={true}` filters via `.eq('is_vocabulary', true)`.
- A custom `title` prop renders as the card heading.
- Clicking a category button navigates to `/flashcards/standard/:categoryId`.

## Notes

Mocks `../lib/supabase` (`supabase.from`) via an explicit factory, then uses the shared [`mockCategories`](./mockCategories.md) helper to chain mocked `select`/`eq`/`order` calls and control what [`useCategories`](../hooks/useCategories.md) resolves with, rather than hitting a real Supabase instance. Since `SelectDeckCard` now navigates via `useNavigate`, every test renders it inside a `MemoryRouter`; the navigation test wraps it in `Routes` with a stub `/flashcards/:deckType/:categoryId` route to assert on. Every render passes a `vocabulary` prop, since it's now required.
