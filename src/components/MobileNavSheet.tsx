import { useState } from 'react'
import { NavLink, useParams } from 'react-router-dom'
import { ChevronDown, LogOut, Menu, Shield } from 'lucide-react'
import { useCategories } from '../hooks/useCategories'
import { useUserRoles } from '../hooks/useUserRoles'
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from './ui/sheet'
import { Button } from './ui/button'
import './MobileNavSheet.css'

interface AdminDisclosureProps {
  onNavigate: () => void
}

/** Touch-friendly expand/collapse list of the superadmin's 5 admin destinations, used in place of the desktop "Admin" dropdown. Mirrors CategoryDisclosure's pattern, but styled with --admin + a Shield icon (via mobile-nav-row--admin) so the privileged area reads as distinct here too, matching the desktop treatment. */
function AdminDisclosure({ onNavigate }: AdminDisclosureProps) {
  const [open, setOpen] = useState(false)
  const listId = 'mobile-nav-admin-list'

  return (
    <div className="mobile-nav-disclosure">
      <button
        type="button"
        className="mobile-nav-row mobile-nav-row--admin mobile-nav-disclosure-trigger"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="mobile-nav-admin-label">
          <Shield className="mobile-nav-admin-icon" size={18} />
          Admin
        </span>
        <ChevronDown
          className="mobile-nav-disclosure-icon"
          size={18}
          data-state={open ? 'open' : 'closed'}
        />
      </button>
      {open && (
        <ul id={listId} className="mobile-nav-disclosure-list">
          <li>
            <NavLink to="/admin" className="mobile-nav-disclosure-item" onClick={onNavigate}>
              Add & tag words
            </NavLink>
          </li>
          <li>
            <NavLink to="/superadmin/categories" className="mobile-nav-disclosure-item" onClick={onNavigate}>
              Manage categories
            </NavLink>
          </li>
          <li>
            <NavLink to="/superadmin/words" className="mobile-nav-disclosure-item" onClick={onNavigate}>
              Manage words
            </NavLink>
          </li>
          <li>
            <NavLink to="/superadmin/roles" className="mobile-nav-disclosure-item" onClick={onNavigate}>
              Manage roles
            </NavLink>
          </li>
          <li>
            <NavLink to="/superadmin/accounts" className="mobile-nav-disclosure-item" onClick={onNavigate}>
              Manage accounts
            </NavLink>
          </li>
        </ul>
      )}
    </div>
  )
}

interface MobileNavSheetProps {
  onSignOut: () => void
}

interface CategoryDisclosureProps {
  vocabulary: boolean
  label: string
  onNavigate: () => void
}

/** Touch-friendly expand/collapse list of categories, used in place of the desktop hover dropdown. */
function CategoryDisclosure({ vocabulary, label, onNavigate }: CategoryDisclosureProps) {
  const { categories, loading } = useCategories(vocabulary)
  const { categoryId } = useParams<{ deckType?: string; categoryId?: string }>()
  const isActive = categories.some((category) => category.id === categoryId)
  const [open, setOpen] = useState(false)
  const listId = `mobile-nav-${vocabulary ? 'vocabulary' : 'categories'}-list`

  return (
    <div className="mobile-nav-disclosure">
      <button
        type="button"
        className="mobile-nav-row mobile-nav-disclosure-trigger"
        aria-expanded={open}
        aria-controls={listId}
        aria-current={isActive ? 'page' : undefined}
        onClick={() => setOpen((value) => !value)}
      >
        {label}
        <ChevronDown
          className="mobile-nav-disclosure-icon"
          size={18}
          data-state={open ? 'open' : 'closed'}
        />
      </button>
      {open && (
        <ul id={listId} className="mobile-nav-disclosure-list">
          {loading ? (
            <li className="mobile-nav-disclosure-item mobile-nav-disclosure-item--muted">
              Loading...
            </li>
          ) : categories.length === 0 ? (
            <li className="mobile-nav-disclosure-item mobile-nav-disclosure-item--muted">
              No categories yet
            </li>
          ) : (
            categories.map((category) => (
              <li key={category.id}>
                <NavLink
                  to={`/flashcards/standard/${category.id}`}
                  className="mobile-nav-disclosure-item"
                  onClick={onNavigate}
                >
                  {category.category_name}
                </NavLink>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  )
}

/** Hamburger-triggered slide-in menu holding the nav links on screens too narrow for the full desktop bar. */
export function MobileNavSheet({ onSignOut }: MobileNavSheetProps) {
  const [open, setOpen] = useState(false)
  const { isAdmin, isSuperadmin, loading: rolesLoading } = useUserRoles()

  function close() {
    setOpen(false)
  }

  function handleSignOut() {
    close()
    onSignOut()
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="flex min-h-11 min-w-11 lg:hidden"
          aria-label="Open menu"
          aria-haspopup="dialog"
        >
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[85vw] max-w-sm">
        <SheetTitle className="sr-only">Navigation menu</SheetTitle>
        <SheetDescription className="sr-only">
          Links to pages and categories, plus sign out.
        </SheetDescription>
        <nav className="mobile-nav-list">
          <NavLink to="/" end className="mobile-nav-row" onClick={close}>
            Home
          </NavLink>
          <CategoryDisclosure vocabulary={false} label="Categories" onNavigate={close} />
          <CategoryDisclosure vocabulary={true} label="Vocabulary" onNavigate={close} />
          <NavLink to="/create-decks" className="mobile-nav-row" onClick={close}>
            Create Decks
          </NavLink>
          <NavLink to="/my-decks" className="mobile-nav-row" onClick={close}>
            My Decks
          </NavLink>
          <NavLink to="/browse-decks" className="mobile-nav-row" onClick={close}>
            Browse Decks
          </NavLink>
          {!rolesLoading && isSuperadmin && <AdminDisclosure onNavigate={close} />}
          {!rolesLoading && !isSuperadmin && isAdmin && (
            <NavLink to="/admin" className="mobile-nav-row mobile-nav-row--admin" onClick={close}>
              <span className="mobile-nav-admin-label">
                <Shield className="mobile-nav-admin-icon" size={18} />
                Admin
              </span>
            </NavLink>
          )}
          <div className="mobile-nav-divider" />
          <button
            type="button"
            className="mobile-nav-row mobile-nav-row--signout"
            onClick={handleSignOut}
          >
            Sign Out
            <LogOut size={18} />
          </button>
        </nav>
      </SheetContent>
    </Sheet>
  )
}
