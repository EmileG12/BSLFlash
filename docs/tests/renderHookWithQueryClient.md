# renderHookWithQueryClient

**Path:** `src/test/renderHookWithQueryClient.tsx`
**Used by:** [useAllCategories](./useAllCategories.md), and any other hook test migrated to React Query's `useQuery`/`useMutation`.

Shared test helper (not a test file) for rendering a hook that calls `useQuery`/`useMutation`. `useQuery` throws if it isn't rendered under a `QueryClientProvider` ancestor, so every such hook's test needs one; this helper wraps `@testing-library/react`'s `renderHook` with a fresh `QueryClient` per call and returns the same result `renderHook` would.

Retries are disabled (`retry: false`) so a test that deliberately mocks a failing response fails immediately instead of retrying first.

## Exports

| Function | Purpose |
|---|---|
| `renderHookWithQueryClient(hook, options?)` | Same signature as `renderHook`, minus `wrapper` (it supplies its own). |

## Notes

The calling test file still mocks `../lib/supabase` itself, exactly as it did before React Query — this helper only supplies the React Query provider, not any Supabase stubbing.
