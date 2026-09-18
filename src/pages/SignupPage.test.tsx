import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { SIGNUP_ALREADY_IN_USE_MESSAGE, signUp } from '../lib/auth'
import { SignupPage } from './SignupPage'

vi.mock('../lib/auth', () => ({
  signUp: vi.fn(),
  MIN_SIGNUP_PASSWORD_LENGTH: 8,
  MAX_SIGNUP_PASSWORD_LENGTH: 64,
  SIGNUP_ALREADY_IN_USE_MESSAGE: 'Email or username are already in use.',
}))

interface FillFormOptions {
  email?: string
  username?: string
  password?: string
  confirm?: string
}

async function fillForm(
  user: ReturnType<typeof userEvent.setup>,
  {
    email = 'new@example.com',
    username = 'newuser',
    password = 'password123',
    confirm = password,
  }: FillFormOptions = {},
) {
  await user.type(screen.getByLabelText(/email/i), email)
  await user.type(screen.getByLabelText(/username/i), username)
  await user.type(screen.getByLabelText('Password'), password)
  await user.type(screen.getByLabelText(/confirm password/i), confirm)
  await user.click(screen.getByRole('button', { name: /sign up/i }))
}

describe('SignupPage', () => {
  it('shows a mismatch error and does not call signUp when passwords differ', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <SignupPage />
      </MemoryRouter>,
    )

    await fillForm(user, { password: 'password123', confirm: 'different123' })

    expect(await screen.findByRole('alert')).toHaveTextContent('Passwords do not match.')
    expect(signUp).not.toHaveBeenCalled()
  })

  it('rejects a password shorter than 8 characters without calling signUp', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <SignupPage />
      </MemoryRouter>,
    )

    await fillForm(user, { password: 'short1', confirm: 'short1' })

    expect(await screen.findByRole('alert')).toHaveTextContent(/between 8 and 64 characters/)
    expect(signUp).not.toHaveBeenCalled()
  })

  it('rejects a password longer than 64 characters without calling signUp', async () => {
    const user = userEvent.setup()
    const tooLong = 'a'.repeat(65)
    render(
      <MemoryRouter>
        <SignupPage />
      </MemoryRouter>,
    )

    await fillForm(user, { password: tooLong, confirm: tooLong })

    expect(await screen.findByRole('alert')).toHaveTextContent(/between 8 and 64 characters/)
    expect(signUp).not.toHaveBeenCalled()
  })

  it('navigates to / when signup succeeds with an active session', async () => {
    vi.mocked(signUp).mockResolvedValueOnce({ hasSession: true })
    const user = userEvent.setup()

    render(
      <MemoryRouter initialEntries={['/signup']}>
        <Routes>
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/" element={<div>Home page</div>} />
        </Routes>
      </MemoryRouter>,
    )

    await fillForm(user)

    expect(await screen.findByText('Home page')).toBeInTheDocument()
  })

  it('navigates to /login when signup succeeds without a session', async () => {
    vi.mocked(signUp).mockResolvedValueOnce({ hasSession: false })
    const user = userEvent.setup()

    render(
      <MemoryRouter initialEntries={['/signup']}>
        <Routes>
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<div>Login page</div>} />
        </Routes>
      </MemoryRouter>,
    )

    await fillForm(user)

    expect(await screen.findByText('Login page')).toBeInTheDocument()
  })

  it('shows SIGNUP_ALREADY_IN_USE_MESSAGE when signUp rejects with it', async () => {
    vi.mocked(signUp).mockRejectedValueOnce(new Error(SIGNUP_ALREADY_IN_USE_MESSAGE))
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <SignupPage />
      </MemoryRouter>,
    )

    await fillForm(user)

    expect(await screen.findByRole('alert')).toHaveTextContent(SIGNUP_ALREADY_IN_USE_MESSAGE)
  })

  it('shows a generic error for any other signUp failure', async () => {
    vi.mocked(signUp).mockRejectedValueOnce(new Error('Something went wrong creating your account. Please try again.'))
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <SignupPage />
      </MemoryRouter>,
    )

    await fillForm(user)

    expect(await screen.findByRole('alert')).toHaveTextContent(/something went wrong/i)
  })

  it('navigates to /login when the Log In link is clicked', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter initialEntries={['/signup']}>
        <Routes>
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<div>Login page</div>} />
        </Routes>
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('link', { name: /log in/i }))

    expect(await screen.findByText('Login page')).toBeInTheDocument()
  })
})
