# WordPicker.browser.test.tsx

**Path:** `src/components/WordPicker.browser.test.tsx`
**Tests:** [WordPicker](../components/WordPicker.md)
**Suite:** `browser` (real Chromium via Playwright) — runs on `npx vitest run --project=browser`, *not* on `npm run test`

## Coverage

- Opening one word's definition popover, then opening a different word's, closes the first and opens the second in a single click; the first popover's text is no longer present afterward.
- Clicking a word's add button while it's visually covered by a different, open definition popover does not add that word.

## Notes

This file exists for two reasons that both require a real browser:

1. **The interaction itself.** In jsdom, `@testing-library/user-event`'s synthetic click on a second trigger gets consumed by Radix's outside-pointerdown dismissal of the first popover, so a single click only closes the old popover rather than also opening the new one — see [WordPicker.md](./WordPicker.md) for that jsdom limitation. Real pointer events don't have this problem.
2. **The geometry this guards against.** [WordPicker](../components/WordPicker.md)'s two columns pack rows tightly, so an open definition popover can render directly on top of the row below it — including that row's own info-icon trigger, and often its much bigger add/remove button too. Both need real layout and hit-testing: jsdom has no layout engine, so `document.elementFromPoint` (what `WordPicker`'s `passClickThroughToCoveredTrigger` uses) can't resolve anything meaningful there.

Both click-through cases need `{ force: true }` on the `userEvent.click` call for the *covered* element's own locator: Playwright's default actionability check refuses to click an element it detects is visually intercepted, which is exactly the state under test. `force: true` skips that refusal while still dispatching a real click at that element's on-screen coordinates, letting the browser's own hit-test route it to whatever's actually on top — the same thing a real user's click at that pixel would do. This was confirmed against the running dev server with hand-dispatched `pointerdown`/`mousedown`/`pointerup`/`mouseup`/click sequences at verified-overlapping coordinates, independent of Playwright's own click heuristics, before trusting these two tests.

`userEvent` is imported from **`vitest/browser`** (Playwright's real input driver, real hit-testing), not `@testing-library/user-event` — using the latter here would reproduce the jsdom behavior inside Chromium and prove nothing, per the same reasoning in [NavBar.browser.md](./NavBar.browser.md).

`src/index.css` is imported directly in this file. In the real app it's pulled in once by `main.tsx`, but rendering `WordPicker` in isolation here skips that import chain — without it, the Tailwind utility classes that produce the real overlapping layout wouldn't be present on the page, and the popovers wouldn't actually cover anything for either test to exercise.

The assertion that the first popover's text is gone uses `expect.poll(...).not.toBeInTheDocument()` rather than a plain `queryByText(...).not.toBeInTheDocument()`, because Radix keeps the closing popover's content mounted (`data-state="closed"`) for its brief exit animation before removing it — same pattern as [NavBar.browser.md](./NavBar.browser.md)'s closing-menu assertion.
