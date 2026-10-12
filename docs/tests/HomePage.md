# HomePage.test.tsx

**Path:** `src/pages/HomePage.test.tsx`
**Tests:** [HomePage](../components/HomePage.md)

## Coverage

- Greets the user by email when a session exists.
- Renders the topic deck picker ("Select a deck") above the vocabulary deck picker ("Select a vocabulary list"), each showing only its own categories (topic vs. GCSE).

## Notes

Mocks `../hooks/useAuth` and `../lib/supabase` (`supabase.from`) via explicit factories. The `eq` mock branches on the `is_vocabulary` value passed in, returning different category data per [SelectDeckCard](../components/SelectDeckCard.md) instance — this is what proves the two cards are independently filtered rather than sharing one fetch. Renders via [renderWithQueryClient](./renderWithQueryClient.md), since each [SelectDeckCard](../components/SelectDeckCard.md) calls [useCategories](../hooks/useCategories.md), which requires a `QueryClientProvider` ancestor.
