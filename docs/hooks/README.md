# Hooks

Custom React hooks, one doc file per hook.

| Hook | Path | Purpose |
|---|---|---|
| [useAuth](./useAuth.md) | `src/hooks/useAuth.ts` | Reactively tracks the current Supabase Auth session. |
| [useCategories](./useCategories.md) | `src/hooks/useCategories.ts` | Fetches all flashcard categories. |
| [useRandomFlashcard](./useRandomFlashcard.md) | `src/hooks/useRandomFlashcard.ts` | Draws a random word + primary video for a category; supports drawing another. |
| [useTenCardsRound](./useTenCardsRound.md) | `src/hooks/useTenCardsRound.ts` | Fetches up to 10 distinct random words + videos for a category, for the "10 Cards" mode. |
| [useWords](./useWords.md) | `src/hooks/useWords.ts` | Fetches all words, for the flashcard guess combobox. |
