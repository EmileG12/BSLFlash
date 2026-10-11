# Hooks

Custom React hooks, one doc file per hook.

| Hook | Path | Purpose |
|---|---|---|
| [useAllCategories](./useAllCategories.md) | `src/hooks/useAllCategories.ts` | Fetches every category, for the Edit deck modal's tag picker. |
| [useAuth](./useAuth.md) | `src/hooks/useAuth.ts` | Reactively tracks the current Supabase Auth session. |
| [useAvailableDeckTags](./useAvailableDeckTags.md) | `src/hooks/useAvailableDeckTags.ts` | Fetches the tags in use on at least one published deck, for the Browse directory's filter chips. |
| [useCategories](./useCategories.md) | `src/hooks/useCategories.ts` | Fetches the flashcard categories that have at least one word, filtered by vocabulary kind. |
| [useCategoryInfo](./useCategoryInfo.md) | `src/hooks/useCategoryInfo.ts` | Looks up one category's or custom deck's display name and whether it's a vocabulary category. |
| [useCustomDeckDetail](./useCustomDeckDetail.md) | `src/hooks/useCustomDeckDetail.ts` | Loads one owned deck's name, publish flag, word ids, and tag ids for the Edit deck modal. |
| [useCustomDecks](./useCustomDecks.md) | `src/hooks/useCustomDecks.ts` | Fetches the signed-in user's own custom decks for My Decks, with a local setter for a renamed deck. |
| [usePublicDecks](./usePublicDecks.md) | `src/hooks/usePublicDecks.ts` | Fetches the published-deck directory for a search, tag filter and sort, with an optimistic-update setter. |
| [useRandomFlashcard](./useRandomFlashcard.md) | `src/hooks/useRandomFlashcard.ts` | Draws a random word + primary video for a category or custom deck; supports drawing another. |
| [useRoundProgress](./useRoundProgress.md) | `src/hooks/useRoundProgress.ts` | Steps through a fixed-length round, tallying correct guesses and flipping to a summary phase after the last card. |
| [useSavedDecks](./useSavedDecks.md) | `src/hooks/useSavedDecks.ts` | Fetches the decks the signed-in user has saved from the Browse directory, with a local setter for removing one after an unsave. |
| [useStreakScore](./useStreakScore.md) | `src/hooks/useStreakScore.ts` | Tracks a consecutive-correct streak, resetting to 0 on a wrong result. |
| [useTenCardsRound](./useTenCardsRound.md) | `src/hooks/useTenCardsRound.ts` | Fetches up to 10 distinct random words + videos for a category or custom deck, for the "10 Cards" mode. |
| [useWords](./useWords.md) | `src/hooks/useWords.ts` | Fetches all words, for the flashcard guess combobox. |
