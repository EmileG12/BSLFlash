import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { signOut } from '../lib/auth'
import { NavBar } from './NavBar'

vi.mock('../lib/auth', () => ({
  signOut: vi.fn(),
}))

describe('NavBar', () => {
  it('renders a Home link', () => {
    render(
      <MemoryRouter>
        <NavBar />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument()
  })

  it('signs the user out and navigates to /login when Sign Out is clicked', async () => {
    vi.mocked(signOut).mockResolvedValueOnce(undefined)
    const user = userEvent.setup()

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<NavBar />} />
          <Route path="/login" element={<div>Login page</div>} />
        </Routes>
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: /sign out/i }))

    expect(signOut).toHaveBeenCalled()
    expect(await screen.findByText('Login page')).toBeInTheDocument()
  })

  it('still navigates to /login even if signOut throws', async () => {
    vi.mocked(signOut).mockRejectedValueOnce(new Error('network error'))
    const user = userEvent.setup()

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<NavBar />} />
          <Route path="/login" element={<div>Login page</div>} />
        </Routes>
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: /sign out/i }))

    expect(await screen.findByText('Login page')).toBeInTheDocument()
  })
})
