# InstallInstructionsDialog

**Path:** `src/components/InstallInstructionsDialog.tsx` (+ `src/components/InstallInstructionsDialog.css`)

**Purpose:** Shared "how to install" dialog for platforms with no one-tap install prompt (iOS Safari, Firefox Android, other browsers). Extracted so that [InstallBanner](./InstallBanner.md) and the "Install App" row in [MobileNavSheet](./MobileNavSheet.md) show identical copy, and the iOS/other branching lives in one place instead of in both callers.

**Props:**

| Prop | Type | Description |
|---|---|---|
| `open` | `boolean` | Controls whether the dialog is shown. |
| `onOpenChange` | `(open: boolean) => void` | Called when the dialog requests a change, e.g. on dismiss. The caller owns the state. |
| `platform` | `InstallPlatform` (`'ios' \| 'android' \| 'other'`) | Selects the instructions copy. Only `'ios'` gets the iOS copy; every other value gets the generic copy. |

**Key behavior:** A shadcn `Dialog` (`src/components/ui/dialog.tsx`) titled "Install BSL Flash". The body is one sentence with a leading icon, chosen by `platform`:

- `'ios'`: a `Share` icon and "Tap the Share icon in Safari's toolbar, then choose Add to Home Screen."
- `'android'` or `'other'`: a `Menu` icon and "Open your browser menu and choose Add to Home Screen."

The component holds no state of its own; visibility is entirely controlled by `open`.

**Depends on:** `Dialog`, `DialogContent`, `DialogDescription`, `DialogHeader`, `DialogTitle` from `src/components/ui/`, [useInstallPrompt](../hooks/useInstallPrompt.md) (type `InstallPlatform` only), `lucide-react` (`Menu`, `Share`).

**Used by:** [InstallBanner](./InstallBanner.md), [MobileNavSheet](./MobileNavSheet.md).
