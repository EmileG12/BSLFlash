# mockCategories

**Path:** `src/test/mockCategories.ts`
**Used by:** [NavBar](./NavBar.md), [NavBar.browser](./NavBar.browser.md), [SelectDeckCard](./SelectDeckCard.md)

Shared test helper (not a test file) that stubs the Supabase query chain [`useCategories`](../hooks/useCategories.md) builds:

```
.from('categories').select(...).eq('is_vocabulary', ...).order(...)
```

Each link returns the next one, and only `.order()` resolves, because that's the call `useCategories` awaits.

## Exports

| Function | Purpose |
|---|---|
| `mockCategories(result)` | Resolves the query with `result` (`{ data, error }`). Returns `{ eq }` so a test can assert which `is_vocabulary` value was filtered on. |
| `mockCategoriesPending()` | Same chain, but the query never settles — for asserting loading states. |

## Notes

The calling test file must still declare `vi.mock('../lib/supabase', ...)` itself. Module mocks are hoisted per file and cannot be registered from a helper, so the helper only fills in the return values of an already-mocked `supabase.from`.
