import { Outlet } from 'react-router-dom'
import { NavBar } from './NavBar'
import { InstallBanner } from './InstallBanner'

/** Wraps all authenticated pages with the persistent top navigation bar. */
export function AppLayout() {
  return (
    <>
      <NavBar />
      <InstallBanner />
      <main>
        <Outlet />
      </main>
    </>
  )
}
