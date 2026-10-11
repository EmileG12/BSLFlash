# Hooks

Custom React hooks, one doc file per hook.

| Hook | Path | Purpose |
|---|---|---|
| [useAuth](./useAuth.md) | `src/hooks/useAuth.ts` | Reactively tracks the current Supabase Auth session. |
| [useCategories](./useCategories.md) | `src/hooks/useCategories.ts` | Fetches all flashcard categories. |
| [useCategoryInfo](./useCategoryInfo.md) | `src/hooks/useCategoryInfo.ts` | Looks up one category's display name and whether it's a vocabulary category. |
| [useCustomCategories](./useCustomCategories.md) | `src/hooks/useCustomCategories.ts` | Fetches the signed-in user's custom decks. |
| [useRandomFlashcard](./useRandomFlashcard.md) | `src/hooks/useRandomFlashcard.ts` | Draws a random word + primary video for a category or custom deck; supports drawing another. |
| [useRoundProgress](./useRoundProgress.md) | `src/hooks/useRoundProgress.ts` | Steps through a fixed-length round, tallying correct guesses and flipping to a summary phase after the last card. |
| [useStreakScore](./useStreakScore.md) | `src/hooks/useStreakScore.ts` | Tracks a consecutive-correct streak, resetting to 0 on a wrong result. |
| [useTenCardsRound](./useTenCardsRound.md) | `src/hooks/useTenCardsRound.ts` | Fetches up to 10 distinct random words + videos for a category or custom deck, for the "10 Cards" mode. |
| [useWords](./useWords.md) | `src/hooks/useWords.ts` | Fetches all words, for the flashcard guess combobox. |
