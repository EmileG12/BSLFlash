import { Outlet } from 'react-router-dom'
import { NavBar } from './NavBar'

/** Wraps all authenticated pages with the persistent top navigation bar. */
export function AppLayout() {
  return (
    <>
      <NavBar />
      <main>
        <Outlet />
      </main>
    </>
  )
}
