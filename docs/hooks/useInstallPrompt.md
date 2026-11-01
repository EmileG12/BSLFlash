# useInstallPrompt

**Path:** `src/hooks/useInstallPrompt.ts`
**Signature:** `useInstallPrompt(): { canInstall: boolean; canPromptNatively: boolean; platform: InstallPlatform; dismissed: boolean; promptInstall: () => Promise<void>; dismiss: () => void }` where `InstallPlatform = 'ios' | 'android' | 'other'`

**Purpose:** Reports whether the app can be installed as a PWA and provides the install actions for the two install surfaces: [InstallBanner](../components/InstallBanner.md) and the "Install App" row in [MobileNavSheet](../components/MobileNavSheet.md).

**Behavior:**

- **Native prompt.** Listens for `beforeinstallprompt` (fired by Chromium/Android only), calls `preventDefault()` and holds the event. `canPromptNatively` is `true` while an event is held. `promptInstall()` calls `prompt()` on the held event and awaits its `userChoice`; an `accepted` outcome clears the event, while any other outcome keeps it.
- **Installed.** Listens for `appinstalled`, which clears the held event and marks the app as standalone.
- **Standalone.** Read once on mount: `display-mode: standalone` media query, or the legacy `navigator.standalone` flag used by iOS Safari. Not re-checked afterwards.
- **`canInstall`** is `!standalone && (canPromptNatively || platform is 'ios' or 'android')`. iOS Safari and Firefox Android never fire `beforeinstallprompt`, so they report installable on platform alone and callers fall back to manual instructions. Desktop browsers report installable only when they offer a native prompt. Viewport is not checked here; mobile-only gating is the caller's job.
- **`platform`** is sniffed from `navigator.userAgent` on every render: iPad/iPhone/iPod, or `Macintosh` with `maxTouchPoints > 1` (iPadOS reports a desktop UA), gives `'ios'`; `Android` gives `'android'`; anything else gives `'other'`.
- **`dismissed`** is initialised from `localStorage` key `bslflash-install-dismissed` (`'true'`) on mount. `dismiss()` writes that key and sets the state. Only the dismissal shown by [InstallBanner](../components/InstallBanner.md) uses it; the nav-sheet row ignores it.

**Why `platform` is only three values:** the one behavioural fork that matters is whether a native prompt exists, which `canPromptNatively` already carries. `platform` exists only to choose which manual-instructions copy [InstallInstructionsDialog](../components/InstallInstructionsDialog.md) shows.

**Shared singleton state:** `beforeinstallprompt` fires once, early, only to listeners already attached at that moment — it is never redispatched. The held event therefore lives in a module-level variable (not component state), with the actual `beforeinstallprompt`/`appinstalled` listeners attached once, as soon as this module is first imported — not inside the hook's `useEffect`. Each `useInstallPrompt()` call just subscribes to a module-level notify list to re-render when that shared value changes. This keeps every call site in sync regardless of mount order: [InstallBanner](../components/InstallBanner.md) (mounted for the whole session via [AppLayout](../components/AppLayout.md)) and the nav-sheet row (mounted only while the sheet is open) both see the same captured event even if the sheet opens well after `beforeinstallprompt` fired. `dismissed` is still per-instance `useState` (each instance reads `localStorage` on its own mount) — only the `deferredEvent` capture needed the singleton treatment, since `dismissed` has no equivalent "fires once, to whoever's listening" hazard.

**Depends on:** nothing beyond React and the browser APIs above.

**Used by:** [InstallBanner](../components/InstallBanner.md), [MobileNavSheet](../components/MobileNavSheet.md) (via its `InstallMenuRow`), [InstallInstructionsDialog](../components/InstallInstructionsDialog.md) (type import of `InstallPlatform` only).
