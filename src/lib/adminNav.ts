export interface AdminNavItem {
  to: string
  label: string
}

/**
 * Superadmin destinations shared by the desktop "Admin" dropdown (NavBar)
 * and the mobile admin disclosure (MobileNavSheet). Grouped by the
 * separators the desktop dropdown renders between them; the mobile list
 * flattens the groups.
 */
export const ADMIN_NAV_GROUPS: AdminNavItem[][] = [
  [{ to: '/admin', label: 'Add & tag words' }],
  [
    { to: '/superadmin/categories', label: 'Manage categories' },
    { to: '/superadmin/words', label: 'Manage words' },
  ],
  [
    { to: '/superadmin/roles', label: 'Manage roles' },
    { to: '/superadmin/accounts', label: 'Manage accounts' },
  ],
]

export const ADMIN_NAV_ITEMS: AdminNavItem[] = ADMIN_NAV_GROUPS.flat()
