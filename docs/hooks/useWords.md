# useWords

**Path:** `src/hooks/useWords.ts`
**Signature:** `useWords(): { words: WordOption[]; loading: boolean; error: string | null }`

**Purpose:** Fetches every row from the [`words`](../db-schema/words.md) table (not category-scoped), for [WordGuessCombobox](../components/WordGuessCombobox.md)'s search list — the flashcard game lets the user search across the entire word list, not just the current category's words.

**Behavior:** On mount, queries `words` for `id, word, definition` ordered by `word`, via the shared [`supabase`](../utils/supabase-client.md) client (RLS allows any authenticated user to read all rows). Same shape/pattern as [useCategories](./useCategories.md): sets `loading` to `false` once the request settles, `error` to the Postgres error message on failure, and guards against setting state after unmount with a `cancelled` flag.

**Used by:** [FlashcardPage](../components/FlashcardPage.md).
