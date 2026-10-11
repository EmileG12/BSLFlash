import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { useUserRoles } from '../hooks/useUserRoles'
import { AdminRoute } from './AdminRoute'

vi.mock('../hooks/useUserRoles', () => ({
  useUserRoles: vi.fn(),
}))

function renderAdminRoute() {
  render(
    <MemoryRouter initialEntries={['/admin']}>
      <Routes>
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<div>Admin page</div>} />
        </Route>
        <Route path="/" element={<div>Home page</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('AdminRoute', () => {
  it('renders nothing while roles are still loading', () => {
    vi.mocked(useUserRoles).mockReturnValue({ isAdmin: false, isSuperadmin: false, loading: true })

    renderAdminRoute()

    expect(screen.queryByText('Admin page')).not.toBeInTheDocument()
    expect(screen.queryByText('Home page')).not.toBeInTheDocument()
  })

  it('redirects to / when the user holds neither role', () => {
    vi.mocked(useUserRoles).mockReturnValue({ isAdmin: false, isSuperadmin: false, loading: false })

    renderAdminRoute()

    expect(screen.getByText('Home page')).toBeInTheDocument()
  })

  it('renders the route for an admin', () => {
    vi.mocked(useUserRoles).mockReturnValue({ isAdmin: true, isSuperadmin: false, loading: false })

    renderAdminRoute()

    expect(screen.getByText('Admin page')).toBeInTheDocument()
  })

  it('renders the route for a superadmin too', () => {
    vi.mocked(useUserRoles).mockReturnValue({ isAdmin: false, isSuperadmin: true, loading: false })

    renderAdminRoute()

    expect(screen.getByText('Admin page')).toBeInTheDocument()
  })
})
