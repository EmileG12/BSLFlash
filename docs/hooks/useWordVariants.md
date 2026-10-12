# useWordVariants

**Path:** `src/hooks/useWordVariants.ts`
**Signature:** `useWordVariants(wordId: string): { variants: WordVariant[]; loading: boolean; error: string | null; setVariants: React.Dispatch<React.SetStateAction<WordVariant[]>> }`

Where `WordVariant` is `{ id: string; variant_name: string; region: string | null; is_primary: boolean; sign_videos: SignVideo[] }` and `SignVideo` is `{ id; storage_path; format; duration_ms; width; height; file_size }`.

**Purpose:** Fetches one word's [`signs`](../db-schema/signs.md) with each sign's [`sign_videos`](../db-schema/sign_videos.md) nested under it, for the superadmin [word edit page](../components/SuperadminWordEditPage.md). Each variant carries its own video pool.

**Key behavior:** Backed by React Query's `useQuery` under query key `['wordVariants', wordId]`, so each word has its own cache entry. The `queryFn` selects `id, variant_name, region, is_primary` with the nested `sign_videos` for `word_id = wordId`, ordered by `variant_name`. The hook maps `isLoading`/`error`/`data` onto `loading`/`error`/`variants`. Requires a `QueryClientProvider` ancestor (wired once in `main.tsx`).

`setVariants` is exposed so the page can flip the primary flag optimistically and revert on error, and append newly added videos and variants without a refetch. It patches the cache entry for the current `wordId`, and does nothing before the first fetch has resolved.

**Depends on:** [supabase-client](../utils/supabase-client.md), the [`signs`](../db-schema/signs.md) and [`sign_videos`](../db-schema/sign_videos.md) tables.

**Used by:** [SuperadminWordEditPage](../components/SuperadminWordEditPage.md).

**Tested by:** [docs/tests/useWordVariants.md](../tests/useWordVariants.md).
