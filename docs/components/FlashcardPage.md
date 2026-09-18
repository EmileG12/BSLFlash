# FlashcardPage

**Path:** `src/pages/FlashcardPage.tsx`
**Route:** `/flashcards/:categoryId` (authenticated, inside [AppLayout](./AppLayout.md))

**Purpose:** The flashcard guessing game. Shows a random word's primary sign video from the given category, lets the user guess it via [WordGuessCombobox](./WordGuessCombobox.md), then reveals whether they were right.

**Props:** None — reads `categoryId` from the URL via `useParams`.

**Key behavior:** A two-phase state machine (`'guessing' | 'revealed'`):
- **`guessing`**: renders the sign video (native `<video>`, autoplaying/muted/looping controls, keyed on `videoUrl` so changing videos forces a real reload — see below) and `WordGuessCombobox`.
- On submit, stores the guessed word id and switches to **`revealed`**: shows "Correct!"/"Incorrect." (green `text-success` / red `text-destructive`) plus the actual `word — definition`, and a "Next sign" button.

**Correctness check:** `guessedWordId === flashcard.wordId` — compared by **id only, never word text**, since `words` allows duplicate `word` text with different `definition`s (homonyms). This comparison lives only in this component.

"Next sign" calls [`useRandomFlashcard`](../hooks/useRandomFlashcard.md)'s `next()` and resets local phase/guess state — it does not exclude the just-shown word, so immediate repeats are possible (a deliberate simplicity choice, see the RPC's own doc).

**Edge cases handled:** no `categoryId` in the URL; the category having zero eligible words (`useRandomFlashcard`'s `empty` flag) → an empty-state message instead of a broken video/combobox; the video failing to load (`onError` on `<video>`) → a fallback message, without blocking the combobox.

**`key={flashcard.videoUrl}` on the `<video>` element:** forces React to unmount/remount the element when the URL changes, rather than patching `src` in place — browsers don't reliably reload a `<video>`'s content on an in-place `src` change.

**Depends on:** [useRandomFlashcard](../hooks/useRandomFlashcard.md), [useWords](../hooks/useWords.md), [WordGuessCombobox](./WordGuessCombobox.md), `Button` from `src/components/ui/`.

**Tested by:** [docs/tests/FlashcardPage.md](../tests/FlashcardPage.md).
