# WordGuessCombobox

**Path:** `src/components/WordGuessCombobox.tsx`

**Purpose:** Searchable combobox over every word (via [useWords](../hooks/useWords.md)), used by [FlashcardPage](./FlashcardPage.md) to let the user guess the word shown in the current flashcard.

**Props:**
| Prop | Type | Description |
|---|---|---|
| `words` | `WordOption[]` | Full word list to search (from `useWords`). |
| `onSubmit` | `(wordId: string) => void` | Called with the selected word's id once the guess is confirmed. |
| `disabled` | `boolean?` | Disables the combobox/Confirm button. |

**Key behavior:** Built on the scaffolded `Combobox` primitive in `src/components/ui/combobox.tsx` (see below). Selecting a word — by clicking it, or via Enter while it's keyboard-highlighted in the open list — only *stages* that word as `selectedWord` and closes the list; it does not submit. Submitting requires a distinct second action: clicking the "Confirm" button (disabled until a word is selected), or pressing Enter again once a word is already selected. This two-step gate exists so that pressing Enter while still narrowing down search results can't accidentally submit the wrong highlighted item.

Words are labeled `"<word> — <definition>"` in the list, since `words.word` isn't unique (homonyms with different definitions share the same text) — the label disambiguates them for the user, though only the `id` is ever passed to `onSubmit`.

**Depends on:** [useWords](../hooks/useWords.md) (for its `WordOption` type — the hook itself is called by `FlashcardPage`, not this component), `Combobox`/`Button` from `src/components/ui/`.

**UI primitives:** `npx shadcn add combobox` scaffolded `src/components/ui/combobox.tsx` (plus `input-group.tsx`, `textarea.tsx` as supporting pieces), built on Base UI's (`@base-ui/react`) `Combobox` primitive — a headless, unstyled combobox (not cmdk/Radix, despite that being the more common shadcn combobox recipe; this project's shadcn registry version uses Base UI instead). Like `button.tsx`/`card.tsx`/`input.tsx`, these are plain owned Tailwind-class source, not documented individually per the existing precedent of only documenting the domain components that consume `ui/` primitives.

**Tested by:** [docs/tests/WordGuessCombobox.md](../tests/WordGuessCombobox.md).
