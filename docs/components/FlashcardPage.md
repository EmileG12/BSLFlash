# FlashcardPage

**Path:** `src/pages/FlashcardPage.tsx`
**Route:** `/flashcards/:deckType/:categoryId/practice` (authenticated, inside [AppLayout](./AppLayout.md))

**Purpose:** The "Practice" game mode — an endless loop of random words from the given category or custom deck, drawn one at a time. Reached via [ModeSelectPage](./ModeSelectPage.md).

**Props:** None — reads `deckType` and `categoryId` from the URL via `useParams`, and an optional subcategory id from `useSearchParams`'s `subcategory` key (set by [ModeSelectPage](./ModeSelectPage.md) when narrowing a vocabulary category). `deckType` is validated against the `'standard' | 'custom'` union (see [useRandomFlashcard](../hooks/useRandomFlashcard.md)'s `DeckType`) and falls back to `'standard'` if the URL segment doesn't match either value, same guard clause as `categoryId` missing entirely — both render the "No category selected" message instead of calling the hook with a bad value.

**Key behavior:** Thin wrapper around [FlashcardRound](./FlashcardRound.md), which owns all the actual per-card gameplay (video, guess combobox, reveal). This page's own job is: fetch the current word via [useRandomFlashcard](../hooks/useRandomFlashcard.md) (passing `categoryId`, `deckType`, and the `subcategory` query param through), fetch the full word list via [useWords](../hooks/useWords.md), handle their loading/error/empty states, then render `<FlashcardRound advanceLabel="Next sign" onAdvance={() => next()} .../>`. The advance callback ignores the result's correctness and draws another random word — Practice draws regardless of whether the guess was right, so immediate repeats are possible (a deliberate simplicity choice, see [the RPC's own doc](../rpc-functions/get_random_word_for_category.md)).

No score is shown or tracked in this mode: Practice has no end condition, so a running streak has nothing to resolve to.

**Layout:** The success render is wrapped in a `<div className="flashcard-page">` (`mx-auto flex max-w-3xl flex-col items-center gap-6 p-4`, defined in `FlashcardPage.css`), the same `max-w-3xl` container [TenCardsPage](./TenCardsPage.md) uses for its summary screen. The card itself is already `max-w-3xl` (see [FlashcardRound](./FlashcardRound.md)), so the wrapper's width matches it. The loading, error, and empty states render as bare `<p>` elements, not inside that wrapper.

**Edge cases handled:** no `categoryId`/`deckType` in the URL, or a `deckType` that isn't `'standard'`/`'custom'`; the category having zero eligible words (`useRandomFlashcard`'s `empty` flag) → an empty-state message instead of rendering `FlashcardRound` with no card.

**Depends on:** [useRandomFlashcard](../hooks/useRandomFlashcard.md), [useWords](../hooks/useWords.md), [FlashcardRound](./FlashcardRound.md).

**Tested by:** [docs/tests/FlashcardPage.md](../tests/FlashcardPage.md).
