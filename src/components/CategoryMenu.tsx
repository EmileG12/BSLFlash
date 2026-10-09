import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import { useCategories } from '../hooks/useCategories'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import './CategoryMenu.css'

interface CategoryMenuProps {
  vocabulary: boolean
  label: string
}

/** Nav dropdown listing flashcard categories (filtered by topic vs. vocabulary-requirement); selecting one navigates to that category's mode-select page. Opens on hover — see NavBar.md and NavBar.browser.md docs for the hover mechanics. */
export function CategoryMenu({ vocabulary, label }: CategoryMenuProps) {
  const { categories, loading } = useCategories(vocabulary)
  const navigate = useNavigate()
  const { categoryId } = useParams<{ deckType?: string; categoryId?: string }>()
  const isActive = categories.some((category) => category.id === categoryId)
  const [open, setOpen] = useState(false)
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const closedByHoverRef = useRef(false)

  useEffect(() => () => clearTimeout(closeTimeoutRef.current), [])

  function handleMouseEnter() {
    clearTimeout(closeTimeoutRef.current)
    setOpen(true)
  }

  function handleMouseLeave() {
    // The dropdown content is portaled, so it isn't a DOM descendant of this
    // wrapper — moving the pointer from the trigger into the content crosses
    // a real gap where neither element is under the cursor, which would fire
    // this handler and close the menu before the user gets there. Delaying
    // the close gives them a moment to cross that gap; handleMouseEnter
    // cancels the timeout if they make it.
    closeTimeoutRef.current = setTimeout(() => {
      closedByHoverRef.current = true
      setOpen(false)
    }, 200)
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
      <div
        className="category-menu-group"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <DropdownMenuTrigger
          className="category-menu-trigger"
          onPointerDown={(event) => event.preventDefault()}
          aria-current={isActive ? 'page' : undefined}
        >
          {label}
          <ChevronDown className="category-menu-icon" size={16} />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="category-menu-content min-w-48 p-0"
          sideOffset={10}
          onCloseAutoFocus={(event) => {
            // Radix returns keyboard focus to the trigger whenever the menu
            // closes, including when our own hover-away timer closes it — that
            // silent refocus was showing a focus ring with nothing the user did
            // to explain it. Only suppress the refocus for that hover-driven
            // case; a real keyboard close (Escape, item selection) should still
            // return focus to the trigger as usual.
            if (closedByHoverRef.current) {
              event.preventDefault()
              closedByHoverRef.current = false
            }
          }}
        >
          {loading ? (
            <DropdownMenuItem disabled className="category-menu-item">
              Loading...
            </DropdownMenuItem>
          ) : categories.length === 0 ? (
            <DropdownMenuItem disabled className="category-menu-item">
              No categories yet
            </DropdownMenuItem>
          ) : (
            categories.map((category) => (
              <DropdownMenuItem
                key={category.id}
                className="category-menu-item"
                onSelect={() => navigate(`/flashcards/standard/${category.id}`)}
              >
                {category.category_name}
              </DropdownMenuItem>
            ))
          )}
        </DropdownMenuContent>
      </div>
    </DropdownMenu>
  )
}
