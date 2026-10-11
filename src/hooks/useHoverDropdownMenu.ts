import { useEffect, useRef, useState } from 'react'

interface HoverDropdownMenu {
  open: boolean
  onOpenChange: (open: boolean) => void
  groupProps: {
    onMouseEnter: () => void
    onMouseLeave: () => void
  }
  triggerProps: {
    onPointerDown: (event: React.PointerEvent) => void
  }
  contentProps: {
    onCloseAutoFocus: (event: Event) => void
  }
}

/**
 * Shared mechanics for a nav `DropdownMenu` that opens on hover instead of
 * click (first built for CategoryMenu, now reused by the Admin nav entry --
 * extracted here rather than duplicated a second time).
 *
 * The dropdown content is portaled, so it isn't a DOM descendant of the
 * trigger's wrapper -- moving the pointer from the trigger into the content
 * crosses a real gap where neither element is under the cursor, which would
 * otherwise close the menu before the user gets there. A 200ms close delay
 * gives them a moment to cross that gap; re-entering cancels it.
 *
 * Radix returns keyboard focus to the trigger whenever the menu closes,
 * including when the hover-away timer closes it -- that silent refocus was
 * showing a focus ring with nothing the user did to explain it. Only the
 * hover-driven close suppresses it; a real keyboard close (Escape, item
 * selection) still returns focus to the trigger as usual.
 */
export function useHoverDropdownMenu(): HoverDropdownMenu {
  const [open, setOpen] = useState(false)
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const closedByHoverRef = useRef(false)

  useEffect(() => () => clearTimeout(closeTimeoutRef.current), [])

  function handleMouseEnter() {
    clearTimeout(closeTimeoutRef.current)
    setOpen(true)
  }

  function handleMouseLeave() {
    closeTimeoutRef.current = setTimeout(() => {
      closedByHoverRef.current = true
      setOpen(false)
    }, 200)
  }

  return {
    open,
    onOpenChange: setOpen,
    groupProps: {
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
    },
    triggerProps: {
      onPointerDown: (event) => event.preventDefault(),
    },
    contentProps: {
      onCloseAutoFocus: (event) => {
        if (closedByHoverRef.current) {
          event.preventDefault()
          closedByHoverRef.current = false
        }
      },
    },
  }
}
