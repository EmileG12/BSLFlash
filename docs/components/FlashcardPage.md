# FlashcardPage

**Path:** `src/pages/FlashcardPage.tsx`
**Route:** `/flashcards/:deckType/:categoryId/practice` (authenticated, inside [AppLayout](./AppLayout.md))

**Purpose:** The "Practice" game mode — an endless loop of random words from the given category or custom deck, drawn one at a time, tracking a consecutive-correct streak. Reached via [ModeSelectPage](./ModeSelectPage.md).

**Props:** None — reads `deckType` and `categoryId` from the URL via `useParams`. `deckType` is validated against the `'standard' | 'custom'` union (see [useRandomFlashcard](../hooks/useRandomFlashcard.md)'s `DeckType`) and falls back to `'standard'` if the URL segment doesn't match either value, same guard clause as `categoryId` missing entirely — both render the "No category selected" message instead of calling the hook with a bad value.

**Key behavior:** Thin wrapper around [FlashcardRound](./FlashcardRound.md), which owns all the actual per-card gameplay (video, guess combobox, reveal). This page's own job is: fetch the current word via [useRandomFlashcard](../hooks/useRandomFlashcard.md) (passing both `categoryId` and `deckType` through) and the full word list via [useWords](../hooks/useWords.md), handle their loading/error/empty states, track the streak via [useStreakScore](../hooks/useStreakScore.md), then render `<FlashcardRound advanceLabel="Next sign" onAdvance={handleAdvance} .../>` where `handleAdvance` records the result's correctness into the streak before drawing another random word — Practice mode draws a new word regardless of whether the guess was right (immediate repeats are possible; a deliberate simplicity choice, see [the RPC's own doc](../rpc-functions/get_random_word_for_category.md)), it just no longer discards the result outright.

The streak resets to 0 whenever `categoryId` changes (a `useEffect` calling `useStreakScore`'s `reset()`), so switching categories via the nav menu doesn't carry over a stale streak from a different deck.

Renders `<ScorePill score={streak} />` (no `round` prop — see [ScorePill](./ScorePill.md), which renders just a "Score" group in that case) next to the card, inside a `.flashcard-round-page`/`.flashcard-round-wrap` layout — `.flashcard-round-page` (`mx-auto flex max-w-4xl flex-col items-center gap-6 p-4`, in `FlashcardPage.css`) is wider than the plain `.flashcard-page` class (`max-w-3xl`, used for the loading/error/empty states here and for [TenCardsPage](./TenCardsPage.md)'s summary screen) specifically to leave room beside the `max-w-3xl` card for the pill. `.flashcard-round-wrap` itself is `flex-col-reverse` (pill above the card) below the `sm` breakpoint and `sm:flex-row` (pill beside the card) above it, so the pill and card stack vertically rather than being squeezed side by side on narrow screens.

**Edge cases handled:** no `categoryId`/`deckType` in the URL, or a `deckType` that isn't `'standard'`/`'custom'`; the category having zero eligible words (`useRandomFlashcard`'s `empty` flag) → an empty-state message instead of rendering `FlashcardRound` with no card.

**Depends on:** [useRandomFlashcard](../hooks/useRandomFlashcard.md), [useWords](../hooks/useWords.md), [useStreakScore](../hooks/useStreakScore.md), [FlashcardRound](./FlashcardRound.md), [ScorePill](./ScorePill.md).

**Tested by:** [docs/tests/FlashcardPage.md](../tests/FlashcardPage.md).
