# useInstallPrompt.test.ts

**Path:** `src/hooks/useInstallPrompt.test.ts`
**Tests:** [useInstallPrompt](../hooks/useInstallPrompt.md)
**Suite:** `unit` (jsdom) — runs on `npm run test`

## Coverage

- Reports `canInstall: false`/`canPromptNatively: false` on a desktop browser that never offers a native prompt.
- Dispatching `beforeinstallprompt` flips `canInstall`/`canPromptNatively` to `true`; calling `promptInstall()` calls the held event's `prompt()` and, on an `accepted` outcome, clears `canPromptNatively` back to `false`.
- Two independently mounted hook instances both see the same captured `beforeinstallprompt` event, even when the second instance mounts after the event already fired — this pins the module-singleton fix described in [useInstallPrompt](../hooks/useInstallPrompt.md) (the bug it replaced: a second instance mounting late, like `MobileNavSheet`'s install row, would otherwise miss the event entirely).
- Dispatching `appinstalled` clears installability (`canInstall: false`).
- On iOS (sniffed via `userAgent`), `canInstall` is `true` even with no native prompt event, with `canPromptNatively: false` and `platform: 'ios'`.
- Already running standalone (`matchMedia('(display-mode: standalone)')` matching) reports `canInstall: false` regardless of platform.
- `dismiss()` writes `localStorage['bslflash-install-dismissed']` and updates `dismissed` immediately.

## Notes

Because the hook's captured `beforeinstallprompt` event lives in a module-level singleton (not per-call `useState`), each test needs a fresh module instance or state would leak across tests in this file — a `freshUseInstallPrompt()` helper calls `vi.resetModules()` then dynamically re-imports `./useInstallPrompt` before every test that touches the native-prompt path. `userAgent` and `matchMedia` are stubbed per test via `Object.defineProperty`/`vi.spyOn` rather than relying on jsdom's defaults. The global `matchMedia` polyfill in `src/test/setup.ts` (added alongside this feature) is what lets this hook — and anything that renders it, like [MobileNavSheet](./MobileNavSheet.md) — run under jsdom at all; without it, `isStandalone()` throws immediately.
