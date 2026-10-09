# TenCardsPage

**Path:** `src/pages/TenCardsPage.tsx`
**Route:** `/flashcards/:deckType/:categoryId/ten-cards` (authenticated, inside [AppLayout](./AppLayout.md))

**Purpose:** The "10 Cards" game mode — a bounded quiz of up to 10 *distinct* words from the category or custom deck (no repeats within a round), ending on a score screen.

**Props:** None — reads `deckType` and `categoryId` from the URL via `useParams`, with the same `'standard' | 'custom'` validation/fallback as [FlashcardPage](./FlashcardPage.md) (see [useRandomFlashcard](../hooks/useRandomFlashcard.md)'s `DeckType`).

**Key behavior:** A page-level state machine, separate from and sitting above [FlashcardRound](./FlashcardRound.md)'s own per-card `guessing`/`revealed` phase — owned by [useRoundProgress](../hooks/useRoundProgress.md) rather than local `useState`s, so the same round-progress logic can be reused by future fixed-length modes (e.g. 50/100 cards):
- `currentIndex: number` — which pre-fetched card is showing.
- `correctCount: number` — running score.
- `phase: 'playing' | 'summary'`.

Fetches the whole round up front via [useTenCardsRound](../hooks/useTenCardsRound.md) (passing both `categoryId` and `deckType` through; no refetching mid-round) and all words via [useWords](../hooks/useWords.md) (for the guess combobox), then calls `useRoundProgress(cards.length)` for the state above and its `handleAdvance`. While `phase === 'playing'`, renders `FlashcardRound` for `cards[currentIndex]`, passing `advanceLabel="Next card"` (or `"See results"` on the last card) and `onAdvance={handleAdvance}`, plus `<ScorePill score={correctCount} round={{ current: currentIndex + 1, total: cards.length }} />` next to the card — renders the Round/Score two-group layout because `round` is given (see [ScorePill](./ScorePill.md)) — not shown on the summary screen, which keeps its own plain-text score instead. While `'summary'`, shows `${correctCount}/${cards.length}` and a button back to [ModeSelectPage](./ModeSelectPage.md) for the same category (`/flashcards/:deckType/:categoryId`), inside the plain `.flashcard-page` (`max-w-3xl`) container; the in-play view uses the wider `.flashcard-round-page`/`.flashcard-round-wrap` layout instead (see [FlashcardPage](./FlashcardPage.md) for those classes) to leave room beside the card for the pill, stacking the pill above the card below the `sm` breakpoint instead of forcing them into a side-by-side row on narrow screens.

Same loading/error/empty guard clauses as [FlashcardPage](./FlashcardPage.md) (checking both `useTenCardsRound` and `useWords`'s states, plus the same `deckType`/`categoryId` URL validation) before rendering anything that indexes into `cards`.

**Depends on:** [useTenCardsRound](../hooks/useTenCardsRound.md), [useWords](../hooks/useWords.md), [useRoundProgress](../hooks/useRoundProgress.md), [FlashcardRound](./FlashcardRound.md), [ScorePill](./ScorePill.md), `Button` from `src/components/ui/`.
