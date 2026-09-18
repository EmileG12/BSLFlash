# WordGuessCombobox.test.tsx

**Path:** `src/components/WordGuessCombobox.test.tsx`
**Tests:** [WordGuessCombobox](../components/WordGuessCombobox.md)

## Coverage

- Confirm is disabled until a word is selected.
- Only the word (not the definition) shows in the list; hovering an option reveals the definition as a tooltip.
- Selecting a word (click) enables Confirm; clicking it calls `onSubmit` with the word's id.
- Typing filters the visible word list.
- Selecting a word then pressing Enter a second time also calls `onSubmit` — the select-then-confirm gate.

## Notes

No Supabase mocking needed — `words` is passed directly as a prop. Exercises the real `@base-ui/react`-backed `Combobox` and `radix-ui`-backed `Tooltip` (no mocking of either), via `userEvent` clicks/typing/keyboard input/hover.

`src/test/setup.ts` stubs `ResizeObserver` globally (a no-op class) — jsdom doesn't implement it, but Radix's `Tooltip` calls it unconditionally (via its size-tracking Arrow), so without the stub any test that mounts a `Tooltip` throws `ReferenceError: ResizeObserver is not defined`.
