# WordPicker.test.tsx

**Path:** `src/components/WordPicker.test.tsx`
**Tests:** [WordPicker](../components/WordPicker.md)
**Suite:** `unit` (jsdom) — runs on `npm run test`

## Coverage

- Clicking a catalog row's word/add target calls `onAdd` and does not open that word's definition popover.
- Clicking a catalog row's info icon shows the word's definition and does not call `onAdd`.
- Clicking a selected (cart) row's info icon shows the word's definition and does not call `onRemove`.
- Clicking anywhere else (e.g. the search input) while a definition popover is open closes it.
- Adding a word to the deck while its own definition popover is open does not leave that popover auto-open once the word re-renders in the selected (cart) column.
- Removing a word from the deck while its own definition popover is open does not leave that popover auto-open once the word re-renders back in the catalog column.

## Notes

Renders `WordPicker` directly with a small in-memory word list and `vi.fn()` spies for `onAdd`/`onRemove` — no `QueryClientProvider` or router needed, since the component takes its data as props. The two move-while-open cases use a `StatefulPicker` test wrapper that actually owns `selectedIds` (mirroring how `CreateDeckPage`/`EditDeckModal` do), since the bug they guard against — `openWordId` matching by id across both columns, with nothing resetting it when a word moves — only reproduces when the prop genuinely changes, not when `onAdd`/`onRemove` are inert spies.

The "only one popover open at a time" behavior (switching from one open popover straight to another) is **not** covered here: in jsdom, `@testing-library/user-event`'s synthetic click lets Radix's outside-pointerdown dismissal consume the event that would have opened the new popover, so the first click only closes the old one and a second click is needed to open the next — that doesn't happen with real pointer events in a browser. See [WordPicker.browser.md](./WordPicker.browser.md) for that case, and for the related case of a popover covering a sibling row's own add/remove button.
