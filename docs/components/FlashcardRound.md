# FlashcardRound

**Path:** `src/components/FlashcardRound.tsx`

**Purpose:** The shared "show one card, guess it, reveal correct/incorrect" unit, extracted out of [FlashcardPage](./FlashcardPage.md) so both [FlashcardPage](./FlashcardPage.md) (Practice) and [TenCardsPage](./TenCardsPage.md) (10 Cards) can render the same gameplay without duplicating it — the two modes only differ in what happens *after* a card is resolved, which is why that decision is pushed up to the caller via `onAdvance` rather than being decided inside this component.

**Props:**
| Prop | Type | Description |
|---|---|---|
| `flashcard` | `Flashcard` | The card to display — assumed already resolved (loading/error/empty states are the caller's responsibility, not this component's). |
| `words` | `WordOption[]` | Full word list for the guess combobox. |
| `advanceLabel` | `string` | Text for the button shown after reveal (e.g. `"Next sign"` for Practice, `"Next card"`/`"See results"` for 10 Cards). |
| `onAdvance` | `(result: { wordId: string; correct: boolean }) => void` | Called when the advance button is clicked, after a guess has been revealed. |

**Key behavior:** Owns a `phase: 'guessing' | 'revealed'` state machine, `guessedWordId`, and `videoError` — identical to what `FlashcardPage` used to own directly. Renders the sign video (`key={flashcard.videoUrl}` forces a remount on card change, since browsers don't reliably reload a `<video>` on an in-place `src` change) and, depending on `phase`, either [WordGuessCombobox](./WordGuessCombobox.md) or the reveal message + advance button.

The whole round (video, combobox, reveal state) renders inside a `Card`/`CardContent` (`.flashcard-round-card`, `w-full max-w-3xl shadow-lg` — same visual treatment as [SelectDeckCard](./SelectDeckCard.md)'s card), rather than being rendered bare into the page. `max-w-3xl` gives the word/definition line room to stay on one line.

The reveal state's "Correct!"/"Incorrect." label renders as a pill (`.flashcard-pill`: `rounded-full px-3 py-1 text-sm font-medium`, a generic shape/spacing class) with white text (`text-primary-foreground`) on a `bg-success`/`bg-destructive` background, rather than plain colored text. `.flashcard-pill` is intentionally generic (not named after "result") — [ScorePill](./ScorePill.md) reuses it for its own pill, pairing it with its own color modifiers instead.

**Correctness check:** `guessedWordId === flashcard.wordId` — by id only, never word text (two different words can share text with different definitions). This is the only place that comparison happens; both `FlashcardPage` and `TenCardsPage` just receive the boolean result via `onAdvance`.

On advancing, resets its own `phase`/`guessedWordId`/`videoError` back to the guessing state (so it's ready for whatever new `flashcard` prop the parent passes next) and calls `onAdvance({ wordId: flashcard.wordId, correct: isCorrect })`. It never decides what "advance" means — `FlashcardPage` ignores the result and draws another random word; `TenCardsPage` uses it to tally the score and step through its pre-fetched round.

While `phase === 'revealed'`, a `window`-level `keydown` listener (added/removed via a `useEffect` with no dependency array, so it re-subscribes every render and always closes over the current `flashcard`/`onAdvance`) advances on Enter — the same action as clicking the advance button — so the user can keep both hands on the keyboard through a full guess/reveal/advance cycle. It ignores `event.repeat` (browser auto-repeat from a held-down key): [WordGuessCombobox](./WordGuessCombobox.md)'s own Enter-to-confirm can leave the physical key still down right as this phase begins, and without the repeat guard that would immediately re-fire here too, advancing before the user can read the reveal.

**Depends on:** [WordGuessCombobox](./WordGuessCombobox.md), `Button` and `Card`/`CardContent` from `src/components/ui/`, the `Flashcard`/`WordOption` types (from [useRandomFlashcard](../hooks/useRandomFlashcard.md)/[useWords](../hooks/useWords.md) respectively — this component doesn't call either hook itself).
