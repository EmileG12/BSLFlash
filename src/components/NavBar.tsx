import { Link, useNavigate } from 'react-router-dom'
import { signOut } from '../lib/auth'
import { CategoryMenu } from './CategoryMenu'
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
