# InstallBanner

**Path:** `src/components/InstallBanner.tsx` (+ `src/components/InstallBanner.css`)

**Purpose:** Dismissible, mobile-only nudge to install the app as a PWA, rendered by [AppLayout](./AppLayout.md) above `<main>`. It is the dismissible install surface; the "Install App" row in [MobileNavSheet](./MobileNavSheet.md) is the persistent one and stays available after this banner is dismissed. Both exist because the banner is a nudge that can be dismissed, and the nav row is an always-available manual option.

**Props:** None.

**Key behavior:**

- Renders nothing unless `useInstallPrompt().canInstall` is `true` and `dismissed` is `false` (see [useInstallPrompt](../hooks/useInstallPrompt.md)).
- The wrapper carries `lg:hidden`, so the banner is never shown at the `lg` breakpoint and up.
- The subtitle changes with `canPromptNatively`: "Add it to your home screen for one-tap access." when a native prompt is held, "Add it to your home screen." otherwise.
- Tapping the main button: if `canPromptNatively`, it calls `promptInstall()` directly. Otherwise it opens [InstallInstructionsDialog](./InstallInstructionsDialog.md) with the hook's `platform`.
- The dismiss button (`aria-label="Dismiss"`) calls the hook's `dismiss()`, which persists the choice to `localStorage`, and the banner unmounts.
- The dialog is a sibling of the banner markup, so it unmounts together with the banner when the banner is hidden or dismissed.

**Depends on:** [useInstallPrompt](../hooks/useInstallPrompt.md), [InstallInstructionsDialog](./InstallInstructionsDialog.md), `lucide-react` (`Download`, `X`).

**Used by:** [AppLayout](./AppLayout.md).
