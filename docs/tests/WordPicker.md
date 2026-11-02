# WordPicker.test.tsx

**Path:** `src/components/WordPicker.test.tsx`
**Tests:** [WordPicker](../components/WordPicker.md)
**Suite:** `unit` (jsdom) — runs on `npm run test`

## Coverage

- Clicking a catalog row's word/add target calls `onAdd` and does not open that word's definition popover.
- Clicking a catalog row's info icon shows the word's definition and does not call `onAdd`.
- Clicking a selected (cart) row's info icon shows the word's definition and does not call `onRemove`.
- Clicking anywhere else (e.g. the search input) while a definition popover is open closes it.

## Notes

Renders `WordPicker` directly with a small in-memory word list and `vi.fn()` spies for `onAdd`/`onRemove` — no `QueryClientProvider` or router needed, since the component takes its data as props. The "only one popover open at a time" behavior (switching from one open popover straight to another) is **not** covered here: in jsdom, `@testing-library/user-event`'s synthetic click lets Radix's outside-pointerdown dismissal consume the event that would have opened the new popover, so the first click only closes the old one and a second click is needed to open the next — that doesn't happen with real pointer events in a browser. See [WordPicker.browser.md](./WordPicker.browser.md) for that case.
