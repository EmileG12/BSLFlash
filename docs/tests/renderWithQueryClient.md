# renderWithQueryClient

**Path:** `src/test/renderWithQueryClient.tsx`
**Used by:** [TagPicker](./TagPicker.md), [EditDeckModal](./EditDeckModal.md), and any other component test whose component (or a hook it calls) uses `useQuery`/`useMutation`.

Shared test helper (not a test file), the component-render counterpart to [renderHookWithQueryClient](./renderHookWithQueryClient.md). Wraps `@testing-library/react`'s `render` with a fresh `QueryClient` (retries disabled) for components that render a hook backed by React Query.

## Exports

| Function | Purpose |
|---|---|
| `renderWithQueryClient(ui, options?)` | Same signature as `render`. |

## Notes

A test file that already builds its own wrapper (e.g. nesting `MemoryRouter`/`Routes` for routing, as [MyDecksPage](./MyDecksPage.md) does) nests `QueryClientProvider` directly in that wrapper instead of using this helper, since only one `wrapper`/outer element can be passed to `render`.
