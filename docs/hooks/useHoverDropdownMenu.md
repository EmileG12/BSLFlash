# useHoverDropdownMenu

**Path:** `src/hooks/useHoverDropdownMenu.ts`
**Signature:** `useHoverDropdownMenu(): { open: boolean; onOpenChange: (open: boolean) => void; groupProps: { onMouseEnter: () => void; onMouseLeave: () => void }; triggerProps: { onPointerDown: (event: React.PointerEvent) => void }; contentProps: { onCloseAutoFocus: (event: Event) => void } }`

**Purpose:** The shared mechanics for a nav Radix `DropdownMenu` that opens on hover instead of click. Extracted from [CategoryMenu](../components/CategoryMenu.md) when the [NavBar](../components/NavBar.md) Admin entry needed the same non-trivial pattern, so the pattern lives in one place rather than being duplicated.

**Behavior:** The hook owns the `open` state and returns three prop bundles, each spread onto one part of the menu:

- `groupProps` goes on the wrapper `<div>` around the trigger and the `DropdownMenuContent`. Entering the wrapper cancels any pending close and opens the menu; leaving it schedules a close after 200ms.
- `triggerProps` goes on the `DropdownMenuTrigger`. Its `onPointerDown` calls `preventDefault()`, which stops Radix's own click-to-toggle from fighting the hover-driven state. Keyboard activation is a separate path and is unaffected.
- `contentProps` goes on the `DropdownMenuContent`. Its `onCloseAutoFocus` suppresses Radix's refocus-the-trigger behavior only when the close was driven by the hover timer. A keyboard close (Escape or item selection) still returns focus to the trigger.

`open` and `onOpenChange` are passed to the Radix `DropdownMenu` root as its controlled props, with `modal={false}` set by the caller.

**Key behavior:**

- **The 200ms close delay exists because the dropdown content is portaled.** It is not a DOM descendant of the wrapper, so moving the pointer from the trigger into the menu crosses a real gap where neither element is under the cursor. Without the delay the menu closes before the user reaches it. Re-entering the wrapper clears the pending timer.
- **The hover-driven close suppresses focus return.** Radix returns focus to the trigger on every close, including the timer-driven one. That silent refocus showed a focus ring with nothing the user had done to explain it, so the hook sets a ref when the timer closes the menu and `onCloseAutoFocus` consumes it.
- The pending close timer is cleared on unmount.

**Used by:** [CategoryMenu](../components/CategoryMenu.md) (Categories and Vocabulary), and the superadmin Admin dropdown in [NavBar](../components/NavBar.md).
