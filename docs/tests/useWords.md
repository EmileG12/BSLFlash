# useWords.test.ts

**Path:** `src/hooks/useWords.test.ts`
**Tests:** [useWords](../hooks/useWords.md)

## Coverage

- Starts in a loading state with an empty word list.
- Returns the fetched words once the request resolves.
- Sets an error message when the fetch fails.
- Returns an empty list when there are no words.

## Notes

Mocks `../lib/supabase` (`supabase.from`) the same way as [SelectDeckCard.test.tsx](./SelectDeckCard.md), chaining mocked `select`/`order` calls. Uses `renderHook` + `waitFor` from `@testing-library/react` to test the hook directly without a wrapping component — `result.current` is the hook's live return value.
