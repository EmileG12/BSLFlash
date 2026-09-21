import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { signOut } from '../lib/auth'
import { useCategories } from '../hooks/useCategories'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import './NavBar.css'

interface CategoryMenuProps {
  vocabulary: boolean
  label: string
}

function CategoryMenu({ vocabulary, label }: CategoryMenuProps) {
  const { categories, loading } = useCategories(vocabulary)
  const navigate = useNavigate()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="navbar-menu-trigger">
        {label}
        <ArrowRight className="navbar-menu-icon" size={16} />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-48">
        {loading ? (
          <DropdownMenuItem disabled>Loading...</DropdownMenuItem>
        ) : categories.length === 0 ? (
          <DropdownMenuItem disabled>No categories yet</DropdownMenuItem>
        ) : (
          categories.map((category) => (
            <DropdownMenuItem
              key={category.id}
              onSelect={() => navigate(`/flashcards/${category.id}`)}
            >
              {category.category_name}
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
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
        <Link to="/" className="navbar-brand">
          Home
        </Link>
        <CategoryMenu vocabulary={false} label="Categories" />
        <CategoryMenu vocabulary={true} label="Vocabulary" />
      </div>
      <button type="button" onClick={handleSignOut} className="navbar-signout">
        Sign Out
      </button>
    </nav>
  )
}
