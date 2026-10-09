import { NavLink, useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { signOut } from '../lib/auth'
import { CategoryMenu } from './CategoryMenu'
import { MobileNavSheet } from './MobileNavSheet'
import './NavBar.css'

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
