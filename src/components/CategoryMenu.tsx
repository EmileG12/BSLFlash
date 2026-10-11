import { useNavigate, useParams } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import { useCategories } from '../hooks/useCategories'
import { useHoverDropdownMenu } from '../hooks/useHoverDropdownMenu'
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

/** Nav dropdown listing flashcard categories (filtered by topic vs. vocabulary-requirement); selecting one navigates to that category's mode-select page. Opens on hover — see NavBar.md and NavBar.browser.md docs for the hover mechanics (shared with the Admin nav entry via useHoverDropdownMenu). */
export function CategoryMenu({ vocabulary, label }: CategoryMenuProps) {
  const { categories, loading } = useCategories(vocabulary)
  const navigate = useNavigate()
  const { categoryId } = useParams<{ deckType?: string; categoryId?: string }>()
  const isActive = categories.some((category) => category.id === categoryId)
  const { open, onOpenChange, groupProps, triggerProps, contentProps } = useHoverDropdownMenu()

  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange} modal={false}>
      <div className="category-menu-group" {...groupProps}>
        <DropdownMenuTrigger
          className="category-menu-trigger"
          aria-current={isActive ? 'page' : undefined}
          {...triggerProps}
        >
          {label}
          <ChevronDown className="category-menu-icon" size={16} />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="category-menu-content min-w-48 p-0"
          sideOffset={10}
          {...contentProps}
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
