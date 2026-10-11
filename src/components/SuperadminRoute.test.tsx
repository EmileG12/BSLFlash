import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { useUserRoles } from '../hooks/useUserRoles'
import { SuperadminRoute } from './SuperadminRoute'

vi.mock('../hooks/useUserRoles', () => ({
  useUserRoles: vi.fn(),
}))

function renderSuperadminRoute() {
  render(
    <MemoryRouter initialEntries={['/superadmin/roles']}>
      <Routes>
        <Route element={<SuperadminRoute />}>
          <Route path="/superadmin/roles" element={<div>Roles page</div>} />
        </Route>
        <Route path="/" element={<div>Home page</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('SuperadminRoute', () => {
  it('renders nothing while roles are still loading', () => {
    vi.mocked(useUserRoles).mockReturnValue({ isAdmin: false, isSuperadmin: false, loading: true })

    renderSuperadminRoute()

    expect(screen.queryByText('Roles page')).not.toBeInTheDocument()
    expect(screen.queryByText('Home page')).not.toBeInTheDocument()
  })

  it('redirects an admin (not superadmin) to /', () => {
    vi.mocked(useUserRoles).mockReturnValue({ isAdmin: true, isSuperadmin: false, loading: false })

    renderSuperadminRoute()

    expect(screen.getByText('Home page')).toBeInTheDocument()
  })

  it('renders the route for a superadmin', () => {
    vi.mocked(useUserRoles).mockReturnValue({ isAdmin: false, isSuperadmin: true, loading: false })

    renderSuperadminRoute()

    expect(screen.getByText('Roles page')).toBeInTheDocument()
  })
})
