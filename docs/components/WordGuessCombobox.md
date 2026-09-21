# WordGuessCombobox

**Path:** `src/components/WordGuessCombobox.tsx`

**Purpose:** Searchable combobox over every word (via [useWords](../hooks/useWords.md)), used by [FlashcardPage](./FlashcardPage.md) to let the user guess the word shown in the current flashcard.

**Props:**
| Prop | Type | Description |
|---|---|---|
| `words` | `WordOption[]` | Full word list to search (from `useWords`). |
| `onSubmit` | `(wordId: string) => void` | Called with the selected word's id once the guess is confirmed. |
| `disabled` | `boolean?` | Disables the combobox/Confirm button. |

**Key behavior:** Built on the scaffolded `Combobox` primitive in `src/components/ui/combobox.tsx` (see below). Selecting a word — by clicking it, via Enter while it's keyboard-highlighted in the open list, or via the top-match Enter shortcut below — only *stages* that word as `selectedWord` and closes the list; it does not submit. Submitting requires a distinct second action: clicking the "Confirm" button (disabled until a word is selected), or pressing Enter again once a word is already selected. This two-step gate exists so that pressing Enter while still narrowing down search results can't accidentally submit the wrong highlighted item.

Pressing Enter while no word is yet staged (`selectedWord` is `null`) stages the top filtered match, same as clicking it — the user doesn't have to arrow down to highlight it first. It reads the live filtered list via Base UI's `Combobox.useFilteredItems()` hook (exported from `src/components/ui/combobox.tsx`), through a `FilteredItemsWatcher` child rendered inside `<Combobox>` (the hook only works inside `Combobox.Root`'s context, so it can't be called from the outer wrapper `div` where the `onKeyDown` handler lives — it syncs the filtered list up via an effect-driven `onChange` callback instead). If the filtered list is empty, Enter clears the input text instead. The input's text is a controlled `inputValue`/`onInputValueChange` pair for this reason — filling it with the matched word's text, or clearing it, both go through that state rather than the combobox's own internal input state.

Only the word itself is shown in the list (`words.word` isn't unique — homonyms with different definitions share the same text — but only the `id` is ever passed to `onSubmit`, so the ambiguity doesn't affect correctness). The definition appears as a tooltip when an option is hovered, via `Tooltip`/`TooltipTrigger`/`TooltipContent` wrapping each `ComboboxItem` (`side="right"`, so it renders outside the combobox popup rather than getting clipped by its `overflow-hidden`). Hovering (or keyboard-highlighting) an option also gives it a `bg-muted` background, via `src/components/WordGuessCombobox.css`'s `[data-highlighted]` selector — `ComboboxItem`'s own built-in `data-highlighted:bg-accent` styling doesn't render anything in light mode, since this project's `--accent` token is only defined in `.dark` (a pre-existing gap in `src/index.css`, not something introduced here); `--muted` is used instead since it has values in both themes. `WordGuessCombobox.css` also applies the same `--shadow-color` box-shadow as `SelectDeckCard`'s category buttons, on the combobox input's `:focus-within` (rather than `:hover`, since a text input's "focused" state is the equivalent interaction).

**Depends on:** [useWords](../hooks/useWords.md) (for its `WordOption` type — the hook itself is called by `FlashcardPage`, not this component), `Combobox`/`Button`/`Tooltip` from `src/components/ui/`, including `useFilteredItems` re-exported from `src/components/ui/combobox.tsx`.

**UI primitives:** `npx shadcn add combobox` scaffolded `src/components/ui/combobox.tsx` (plus `input-group.tsx`, `textarea.tsx` as supporting pieces), built on Base UI's (`@base-ui/react`) `Combobox` primitive — a headless, unstyled combobox (not cmdk/Radix, despite that being the more common shadcn combobox recipe; this project's shadcn registry version uses Base UI instead). `npx shadcn add tooltip` scaffolded `src/components/ui/tooltip.tsx`, built on **Radix's** Tooltip primitive (a different underlying library than the combobox, both already present as dependencies) — portal-based, so its content escapes any clipping/`overflow-hidden` ancestor and positions itself relative to the trigger. Like `button.tsx`/`card.tsx`/`input.tsx`, these are all plain owned Tailwind-class source, not documented individually per the existing precedent of only documenting the domain components that consume `ui/` primitives.

**Tested by:** [docs/tests/WordGuessCombobox.md](../tests/WordGuessCombobox.md).
