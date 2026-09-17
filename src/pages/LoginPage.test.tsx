import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { LOGIN_ERROR_MESSAGE, signInWithPassword } from '../lib/auth'
import { LoginPage } from './LoginPage'

// Mocking ../lib/auth (rather than the Supabase client it wraps) is the
// payoff of keeping auth calls in their own module: the component test
// only cares "what does the form do when signInWithPassword succeeds or
// throws," not how Supabase itself behaves.
vi.mock('../lib/auth', () => ({
  signInWithPassword: vi.fn(),
  LOGIN_ERROR_MESSAGE: 'Email or password are incorrect.',
}))

describe('LoginPage', () => {
  it('shows the generic error message when credentials are invalid', async () => {
    vi.mocked(signInWithPassword).mockRejectedValueOnce(new Error(LOGIN_ERROR_MESSAGE))
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    )

    await user.type(screen.getByLabelText(/email/i), 'wrong@example.com')
    await user.type(screen.getByLabelText(/password/i), 'wrongpass')
    await user.click(screen.getByRole('button', { name: /log in/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(LOGIN_ERROR_MESSAGE)
  })

  it('navigates to / after a successful login', async () => {
    vi.mocked(signInWithPassword).mockResolvedValueOnce(undefined)
    const user = userEvent.setup()

    // Rendering real routes and asserting on what ends up on screen (rather
    // than mocking react-router's useNavigate) tests actual navigation
    // behavior instead of an implementation detail.
    render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<div>Home page</div>} />
        </Routes>
      </MemoryRouter>,
    )

    await user.type(screen.getByLabelText(/email/i), 'user@signstack.local')
    await user.type(screen.getByLabelText(/password/i), 'User123!')
    await user.click(screen.getByRole('button', { name: /log in/i }))

    expect(await screen.findByText('Home page')).toBeInTheDocument()
  })
})
