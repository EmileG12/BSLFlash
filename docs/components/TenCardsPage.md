# TenCardsPage

**Path:** `src/pages/TenCardsPage.tsx`
**Route:** `/flashcards/:categoryId/ten-cards` (authenticated, inside [AppLayout](./AppLayout.md))

**Purpose:** The "10 Cards" game mode — a bounded quiz of up to 10 *distinct* words from the category (no repeats within a round), ending on a score screen.

**Props:** None — reads `categoryId` from the URL via `useParams`.

**Key behavior:** A page-level state machine, separate from and sitting above [FlashcardRound](./FlashcardRound.md)'s own per-card `guessing`/`revealed` phase:
- `currentIndex: number` — which pre-fetched card is showing.
- `correctCount: number` — running score.
- `phase: 'playing' | 'summary'`.

Fetches the whole round up front via [useTenCardsRound](../hooks/useTenCardsRound.md) (no refetching mid-round) and all words via [useWords](../hooks/useWords.md) (for the guess combobox). While `phase === 'playing'`, renders `FlashcardRound` for `cards[currentIndex]`, passing `advanceLabel="Next card"` (or `"See results"` on the last card) and an `onAdvance` handler that increments `correctCount` on a correct guess, then either advances `currentIndex` or — if that was the last card — switches to `'summary'`. While `'summary'`, shows `${correctCount}/${cards.length}` and a button back to [ModeSelectPage](./ModeSelectPage.md) for the same category.

Same loading/error/empty guard clauses as [FlashcardPage](./FlashcardPage.md) (checking both `useTenCardsRound` and `useWords`'s states) before rendering anything that indexes into `cards`.

**Depends on:** [useTenCardsRound](../hooks/useTenCardsRound.md), [useWords](../hooks/useWords.md), [FlashcardRound](./FlashcardRound.md), `Button` from `src/components/ui/`.
