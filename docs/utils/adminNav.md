# adminNav

**Path:** `src/lib/adminNav.ts`
**Signatures:**
- `interface AdminNavItem { to: string; label: string }`
- `ADMIN_NAV_GROUPS: AdminNavItem[][]`
- `ADMIN_NAV_ITEMS: AdminNavItem[]` (= `ADMIN_NAV_GROUPS.flat()`)

**Purpose:** Single source for the five superadmin destinations (`/admin` "Add & tag words"; `/superadmin/categories` "Manage categories"; `/superadmin/words` "Manage words"; `/superadmin/roles` "Manage roles"; `/superadmin/accounts` "Manage accounts"). Extracted because these routes and labels were previously hand-duplicated between [NavBar](../components/NavBar.md) and [MobileNavSheet](../components/MobileNavSheet.md). A route added to one and not the other would diverge silently, with nothing to catch it.

**Key behavior:** Kept as groups (`ADMIN_NAV_GROUPS`) rather than a flat list only because the desktop dropdown needs the group boundaries to know where to render its separators. [NavBar](../components/NavBar.md) maps over the groups and inserts a separator between them. `ADMIN_NAV_ITEMS` is the same data flattened for [MobileNavSheet](../components/MobileNavSheet.md), which has no separators.

**Used by:** [NavBar](../components/NavBar.md) (`ADMIN_NAV_GROUPS`), [MobileNavSheet](../components/MobileNavSheet.md) (`ADMIN_NAV_ITEMS`).
