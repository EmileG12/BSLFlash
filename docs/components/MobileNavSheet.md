# MobileNavSheet

**Path:** `src/components/MobileNavSheet.tsx` (+ `src/components/MobileNavSheet.css`)

**Purpose:** Hamburger-triggered slide-in menu holding the nav links for screens too narrow for the full desktop [NavBar](./NavBar.md) (below the `lg` breakpoint, 1024px). Rendered by `NavBar` alongside the desktop bar, not in place of it.

**Props:**

| Prop | Type | Description |
|---|---|---|
| `onSignOut` | `() => void` | Called after the sheet closes when "Sign Out" is clicked. |

**Key behavior:**

- The hamburger trigger (`Menu` icon, `lg:hidden`) opens a shadcn `Sheet` (`src/components/ui/sheet.tsx`, Radix `Dialog` underneath) sliding in from the right, sized `w-[85vw] max-w-sm`. `SheetTitle` and `SheetDescription` are both rendered `sr-only` — the sheet has no visible heading or description, but Radix's `Dialog.Content` requires both for accessible naming and warns in the console if either is missing.
- Inside, `nav.mobile-nav-list` renders: a "Home" link, two `CategoryDisclosure`s ("Categories" / "Vocabulary"), "Create Decks", "My Decks", "Browse Decks" (→ [BrowseDecksPage](./BrowseDecksPage.md)), an admin entry (below), a divider, then "Sign Out".
- **Admin entry** is decided by [useUserRoles](../hooks/useUserRoles.md) and only rendered once roles have loaded. A superadmin gets `AdminDisclosure`, an expand/collapse list with the same five destinations as the desktop dropdown in [NavBar](./NavBar.md). An `admin` who is not a superadmin gets a single plain "Admin" link to `/admin`. A plain user gets nothing.
- **Admin styling** matches the desktop entry: both the disclosure trigger and the plain link carry `mobile-nav-row--admin`, which recolors the active state (`aria-current` / `aria-expanded='true'`) to the `--admin` token instead of `--brand`, and each shows a leading `Shield` icon. The icon and text sit inside a `mobile-nav-admin-label` span so the row's `justify-content: space-between` does not split the icon from the label.
- **`AdminDisclosure`** is a local component in this file that mirrors `CategoryDisclosure`'s expand/collapse pattern. Its five links are static and do not call `useCategories`. Each link calls `onNavigate` (the sheet's `close`), so the sheet closes before navigating.
- **`CategoryDisclosure`** is this component's own touch-friendly expand/collapse list — a button toggling `open` state, with a `ChevronDown` that rotates 180° via `data-state`/`.mobile-nav-disclosure-icon[data-state='open']` when expanded, followed by a `<ul>` of category links when open. It calls [`useCategories`](../hooks/useCategories.md) directly rather than rendering [CategoryMenu](./CategoryMenu.md)'s dropdown markup — `CategoryMenu`'s hover-enter/leave timers and Radix dropdown model are built for a pointer, not touch, so only the data-fetching hook is shared between the two, not the UI. Same loading/"No categories yet" states as `CategoryMenu`.
- On the desktop side, [NavBar](./NavBar.md)'s link group is hidden below `lg` purely via Tailwind's `hidden`/`lg:` utilities rather than conditional rendering, so it stays mounted in the DOM at all times regardless of viewport. This component's own "Categories"/"Vocabulary" `CategoryDisclosure` controls, by contrast, only exist in the DOM while the `Sheet` itself is open (Radix's `Dialog.Content` doesn't render its children while closed) — which is what keeps `NavBar.test.tsx`'s existing role queries (expecting exactly one "Categories" button) passing unchanged: there's only ever one such button mounted unless the sheet has been opened.
- Clicking any link, or a category inside a disclosure, calls `close` (via each link's `onClick`) to close the sheet before navigating. "Sign Out" closes the sheet first, then calls `onSignOut`.
- "Sign Out" is styled to look deliberately different from the other rows — bold text plus a brand-tinted hover/focus background (`.mobile-nav-row--signout`) and a trailing `LogOut` icon — the same intentional Sign-Out-stands-apart treatment `NavBar` gives it on desktop (bordered chip + icon there), not an inconsistency.
- `@media (prefers-reduced-motion: reduce)` in `MobileNavSheet.css` disables the sheet's slide/fade transition and the disclosure chevron's rotation.

**Depends on:** [useCategories](../hooks/useCategories.md), [useUserRoles](../hooks/useUserRoles.md), `Sheet`/`SheetContent`/`SheetTitle`/`SheetTrigger` and `Button` from `src/components/ui/`, `lucide-react` (`ChevronDown`, `LogOut`, `Menu`, `Shield`).

**Used by:** [NavBar](./NavBar.md).

**Tested by:** [docs/tests/MobileNavSheet.md](../tests/MobileNavSheet.md).
