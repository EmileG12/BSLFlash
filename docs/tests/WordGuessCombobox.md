# WordGuessCombobox.test.tsx

**Path:** `src/components/WordGuessCombobox.test.tsx`
**Tests:** [WordGuessCombobox](../components/WordGuessCombobox.md)

## Coverage

- Confirm is disabled until a word is selected.
- Selecting a word (click) enables Confirm; clicking it calls `onSubmit` with the word's id.
- Typing filters the visible word list.
- Selecting a word then pressing Enter a second time also calls `onSubmit` — the select-then-confirm gate.

## Notes

No Supabase mocking needed — `words` is passed directly as a prop. Exercises the real `@base-ui/react`-backed `Combobox` from `src/components/ui/combobox.tsx` (no mocking of the combobox itself), via `userEvent` clicks/typing/keyboard input.
