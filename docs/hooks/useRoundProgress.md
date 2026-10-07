# useRoundProgress

**Path:** `src/hooks/useRoundProgress.ts`
**Signature:** `useRoundProgress(totalCards: number): { currentIndex: number; correctCount: number; phase: 'playing' | 'summary'; isLastCard: boolean; handleAdvance: (result: { wordId: string; correct: boolean }) => void }`

**Purpose:** Steps through a fixed-length round of `totalCards` pre-fetched cards, tallying correct guesses and flipping to `'summary'` after the last card. Backs [TenCardsPage](../components/TenCardsPage.md)'s ("10 Cards" mode) round state and its `Round: x/N | Score: y/N` pill.

**Behavior:** `handleAdvance(result)` — the same shape [FlashcardRound](../components/FlashcardRound.md)'s `onAdvance` prop expects — increments `correctCount` when `result.correct` is `true`, then either advances `currentIndex` or, if `currentIndex` was the last card (`currentIndex + 1 >= totalCards`), sets `phase` to `'summary'` instead of advancing past the end. `isLastCard` is `currentIndex === totalCards - 1`, used by the caller to swap the advance button's label to `"See results"` on the final card.

Takes `totalCards` as a parameter (rather than hardcoding 10) specifically so it's reusable by any future fixed-length round mode (e.g. a "50 Cards" or "100 Cards" page) without change — a caller only needs to pass a different `totalCards` (typically `cards.length` from its own data-fetching hook, e.g. [useTenCardsRound](./useTenCardsRound.md)). This hook owns only the round-progress bookkeeping; it does not fetch cards itself.

**Used by:** [TenCardsPage](../components/TenCardsPage.md).
