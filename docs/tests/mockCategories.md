# mockCategories

**Path:** `src/test/mockCategories.ts`
**Used by:** [NavBar](./NavBar.md), [NavBar.browser](./NavBar.browser.md), [SelectDeckCard](./SelectDeckCard.md), [MobileNavSheet](./MobileNavSheet.md)

Shared test helper (not a test file) that stubs the Supabase call [`useCategories`](../hooks/useCategories.md) makes:

```
.rpc('get_categories_with_words', { p_is_vocabulary })
```

It is a single awaited call, so the helper just sets the resolved value of the mocked `supabase.rpc`.

## Exports

| Function | Purpose |
|---|---|
| `mockCategories(result)` | Resolves `supabase.rpc` with `result` (`{ data, error }`). |
| `mockCategoriesPending()` | Same call, but it never settles — for asserting loading states. |

Assertions on which `is_vocabulary` value was requested read the mocked `rpc`'s call arguments directly, since the helper no longer returns a chain.

## Notes

The calling test file must still declare `vi.mock('../lib/supabase', ...)` itself, with `rpc: vi.fn()`. Module mocks are hoisted per file and cannot be registered from a helper, so the helper only fills in the return value of an already-mocked `supabase.rpc`.
