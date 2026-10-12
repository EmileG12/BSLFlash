# queryClient

**Path:** `src/lib/queryClient.ts`

**Purpose:** The single `QueryClient` instance backing React Query across the app. Exported as its own module, separate from `main.tsx` (which provides it via `QueryClientProvider`), so that non-component code — currently [`signOut`](./auth.md) — can import and call methods on it directly without needing a hook.

**Exports:**

| Export | Type | Description |
|---|---|---|
| `queryClient` | `QueryClient` | Created with no `defaultOptions`, so every query uses React Query's library defaults (3 retries with exponential backoff, ~7s total, before a failed query surfaces an error; stale-immediately plus refetch-on-focus/reconnect unless a hook overrides it, as [useRandomFlashcard](../hooks/useRandomFlashcard.md) and [useTenCardsRound](../hooks/useTenCardsRound.md) do). |

**Used by:** `main.tsx` (wraps the app in `QueryClientProvider`), [`auth`](./auth.md) (`signOut` calls `queryClient.clear()`).
