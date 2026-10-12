# useWords

**Path:** `src/hooks/useWords.ts`
**Signature:** `useWords(): { words: WordOption[]; loading: boolean; error: string | null }`

**Purpose:** Fetches every row from the [`words`](../db-schema/words.md) table (not category-scoped), for [WordGuessCombobox](../components/WordGuessCombobox.md)'s search list and for the superadmin and deck-building pages that need the full word list.

**Behavior:** Backed by React Query's `useQuery` under query key `['words']`. The `queryFn` selects `id, word, definition` from `words` ordered by `word`, via the shared [`supabase`](../utils/supabase-client.md) client (RLS allows any authenticated user to read all rows). A Postgres error is thrown so React Query reports it as `error`. The hook maps `isLoading`/`error`/`data` back onto the `loading`/`error`/`words` shape. Requires a `QueryClientProvider` ancestor (wired once in `main.tsx`).

All callers share the single cache entry under `['words']`. A later mount shows the cached list immediately and refetches in the background.

**Used by:** [FlashcardPage](../components/FlashcardPage.md), [TenCardsPage](../components/TenCardsPage.md), [CreateDeckPage](../components/CreateDeckPage.md), [EditDeckModal](../components/EditDeckModal.md), [AdminPage](../components/AdminPage.md), [SuperadminWordsPage](../components/SuperadminWordsPage.md).

**Tested by:** [docs/tests/useWords.md](../tests/useWords.md).
