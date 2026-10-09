import { useState } from 'react'
import { NavLink, useParams } from 'react-router-dom'
import { ChevronDown, LogOut, Menu } from 'lucide-react'
import { useCategories } from '../hooks/useCategories'
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from './ui/sheet'
import { Button } from './ui/button'
import './MobileNavSheet.css'

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
