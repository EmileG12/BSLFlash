import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { ChevronDown, LogOut, Shield } from 'lucide-react'
import { signOut } from '../lib/auth'
import { useUserRoles } from '../hooks/useUserRoles'
import { useHoverDropdownMenu } from '../hooks/useHoverDropdownMenu'
import { CategoryMenu } from './CategoryMenu'
import { MobileNavSheet } from './MobileNavSheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import './NavBar.css'
import './AdminMenu.css'

/**
 * Admin nav entry -- a plain link for admin-only users (one destination
 * isn't worth a dropdown), a full dropdown for superadmins (who pass every
 * admin-gated route too). Renders nothing while roles are resolving or for a
 * plain user, to avoid a flash of the wrong nav state. Styled with the
 * --admin token (not --brand, which already means "current page/CTA" on
 * every other nav item) and a Shield icon, so this privileged area reads as
 * distinct from the regular content destinations around it -- in both the
 * link and dropdown-trigger forms. The dropdown opens on hover, matching
 * CategoryMenu's mechanics via the shared useHoverDropdownMenu hook.
 */
function AdminNavEntry() {
  const { isAdmin, isSuperadmin, loading } = useUserRoles()
  const { open, onOpenChange, groupProps, triggerProps, contentProps } = useHoverDropdownMenu()
  const { pathname } = useLocation()
  const isActive = pathname.startsWith('/admin') || pathname.startsWith('/superadmin')

  if (loading || (!isAdmin && !isSuperadmin)) return null

  if (!isSuperadmin) {
    return (
      <NavLink to="/admin" className="navbar-admin-link">
        <Shield className="navbar-admin-icon" size={16} />
        Admin
      </NavLink>
    )
  }

  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange} modal={false}>
      <div className="admin-menu-group" {...groupProps}>
        <DropdownMenuTrigger
          className="admin-menu-trigger"
          aria-current={isActive ? 'page' : undefined}
          {...triggerProps}
        >
          <Shield className="admin-menu-icon" size={16} />
          Admin
          <ChevronDown className="admin-menu-icon" size={16} />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="admin-menu-content min-w-48 p-0"
          sideOffset={10}
          {...contentProps}
        >
          <DropdownMenuItem className="admin-menu-item" asChild>
            <NavLink to="/admin">Add & tag words</NavLink>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="admin-menu-item" asChild>
            <NavLink to="/superadmin/categories">Manage categories</NavLink>
          </DropdownMenuItem>
          <DropdownMenuItem className="admin-menu-item" asChild>
            <NavLink to="/superadmin/words">Manage words</NavLink>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="admin-menu-item" asChild>
            <NavLink to="/superadmin/roles">Manage roles</NavLink>
          </DropdownMenuItem>
          <DropdownMenuItem className="admin-menu-item" asChild>
            <NavLink to="/superadmin/accounts">Manage accounts</NavLink>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </div>
    </DropdownMenu>
  )
}

export function NavBar() {
  const navigate = useNavigate()

  async function handleSignOut() {
    try {
      await signOut()
    } catch {
      // Non-blocking: the user is redirected to /login below regardless,
      // since the local session should be treated as ended either way.
    } finally {
      navigate('/login', { replace: true })
    }
  }

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <img src="/bsl-long-logo.svg" alt="SignStack" className="navbar-logo" />
        <div className="hidden items-center gap-7 lg:flex">
          <NavLink to="/" end className="navbar-brand">
            Home
          </NavLink>
          <CategoryMenu vocabulary={false} label="Categories" />
          <CategoryMenu vocabulary={true} label="Vocabulary" />
          <NavLink to="/create-decks" className="navbar-brand">
            Create Decks
          </NavLink>
          <NavLink to="/my-decks" className="navbar-brand">
            My Decks
          </NavLink>
          <NavLink to="/browse-decks" className="navbar-brand">
            Browse Decks
          </NavLink>
          <AdminNavEntry />
        </div>
      </div>
      <button
        type="button"
        onClick={handleSignOut}
        className="navbar-signout hidden items-center gap-1.5 lg:inline-flex"
      >
        Sign Out
        <LogOut size={16} />
      </button>
      <MobileNavSheet onSignOut={handleSignOut} />
    </nav>
  )
}
