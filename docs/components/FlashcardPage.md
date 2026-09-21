# FlashcardPage

**Path:** `src/pages/FlashcardPage.tsx`
**Route:** `/flashcards/:categoryId/practice` (authenticated, inside [AppLayout](./AppLayout.md))

**Purpose:** The "Practice" game mode — an endless loop of random words from the given category, drawn one at a time, with no score tracked. Reached via [ModeSelectPage](./ModeSelectPage.md).

**Props:** None — reads `categoryId` from the URL via `useParams`.

**Key behavior:** Thin wrapper around [FlashcardRound](./FlashcardRound.md), which owns all the actual per-card gameplay (video, guess combobox, reveal). This page's own job is just: fetch the current word via [useRandomFlashcard](../hooks/useRandomFlashcard.md) and the full word list via [useWords](../hooks/useWords.md), handle their loading/error/empty states, then render `<FlashcardRound advanceLabel="Next sign" onAdvance={() => next()} .../>` — ignoring `onAdvance`'s result entirely, since Practice mode draws another random word regardless of whether the guess was right (immediate repeats are possible; a deliberate simplicity choice, see [the RPC's own doc](../rpc-functions/get_random_word_for_category.md)).

**Edge cases handled:** no `categoryId` in the URL; the category having zero eligible words (`useRandomFlashcard`'s `empty` flag) → an empty-state message instead of rendering `FlashcardRound` with no card.

**Depends on:** [useRandomFlashcard](../hooks/useRandomFlashcard.md), [useWords](../hooks/useWords.md), [FlashcardRound](./FlashcardRound.md).

**Tested by:** [docs/tests/FlashcardPage.md](../tests/FlashcardPage.md).
