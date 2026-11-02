# WordPicker.browser.test.tsx

**Path:** `src/components/WordPicker.browser.test.tsx`
**Tests:** [WordPicker](../components/WordPicker.md)
**Suite:** `browser` (real Chromium via Playwright) — runs on `npx vitest run --project=browser`, *not* on `npm run test`

## Coverage

- Opening one word's definition popover, then opening a different word's, closes the first and opens the second in a single click; the first popover's text is no longer present afterward.

## Notes

This file exists for two reasons that both require a real browser:

1. **The interaction itself.** In jsdom, `@testing-library/user-event`'s synthetic click on a second trigger gets consumed by Radix's outside-pointerdown dismissal of the first popover, so a single click only closes the old popover rather than also opening the new one — see [WordPicker.md](./WordPicker.md) for that jsdom limitation. Real pointer events don't have this problem.
2. **The bug this guards against.** [WordPicker](../components/WordPicker.md)'s two columns pack rows tightly, so an open definition popover can render directly on top of the very next row — including that row's own info-icon trigger. A real click there used to time out because the popover's hit-test area (not just its paint) intercepted the pointer event; `document.elementFromPoint` at that location resolved to the popover's `role="dialog"` content, not the button underneath. This is fixed by `pointer-events: none` scoped to this popover (see the "Key behavior" section of [WordPicker.md](./WordPicker.md)), and this test is what would catch a regression of that fix.

`userEvent` is imported from **`vitest/browser`** (Playwright's real input driver, real hit-testing), not `@testing-library/user-event` — using the latter here would reproduce the jsdom behavior inside Chromium and prove nothing, per the same reasoning in [NavBar.browser.md](./NavBar.browser.md).

`src/index.css` is imported directly in this file. In the real app it's pulled in once by `main.tsx`, but rendering `WordPicker` in isolation here skips that import chain — without it, neither the Tailwind utility classes nor the `pointer-events` fix would be present on the page, and the test would fail for the wrong reason (no styling at all) rather than exercising the actual fix.

The assertion that the first popover's text is gone uses `expect.poll(...).not.toBeInTheDocument()` rather than a plain `queryByText(...).not.toBeInTheDocument()`, because Radix keeps the closing popover's content mounted (`data-state="closed"`) for its brief exit animation before removing it — same pattern as [NavBar.browser.md](./NavBar.browser.md)'s closing-menu assertion.
