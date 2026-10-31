import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { signOut } from '../lib/auth'
import { useUserRoles } from '../hooks/useUserRoles'
import { mockCategories } from '../test/mockCategories'
import { renderWithQueryClient } from '../test/renderWithQueryClient'
import { NavBar } from './NavBar'

vi.mock('../lib/auth', () => ({
  signOut: vi.fn(),
}))

vi.mock('../lib/supabase', () => ({
  supabase: {
    rpc: vi.fn(),
  },
}))

vi.mock('../hooks/useUserRoles', () => ({
  useUserRoles: vi.fn(),
}))

/**
 * Opens a nav dropdown by keyboard rather than by click. Radix's DismissableLayer
 * registers its outside-dismiss listeners in a `setTimeout(..., 0)` so the very
 * pointerdown that opened the menu isn't read as an outside click. In the first
 * test of a file that timer lands after the click finishes, but in later tests it
 * lands mid-click, so the trailing `click` dismisses the menu again and the test
 * sees it closed. Enter on the focused trigger opens the menu the same way a
 * keyboard user would, without touching that pointer machinery.
 */
async function openMenu(user: ReturnType<typeof userEvent.setup>, name: RegExp) {
  screen.getByRole('button', { name }).focus()
  await user.keyboard('{Enter}')
}

describe('NavBar', () => {
  beforeEach(() => {
    vi.mocked(useUserRoles).mockReturnValue({ isAdmin: false, isSuperadmin: false, loading: false })
  })

  it('renders a Home link', () => {
    mockCategories({ data: [], error: null })

    renderWithQueryClient(
      <MemoryRouter>
        <NavBar />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument()
  })

  it('renders the BSLFlash logo', () => {
    mockCategories({ data: [], error: null })

    renderWithQueryClient(
      <MemoryRouter>
        <NavBar />
      </MemoryRouter>,
    )

    expect(screen.getByRole('img', { name: /bslflash/i })).toBeInTheDocument()
  })

  it('signs the user out and navigates to /login when Sign Out is clicked', async () => {
    mockCategories({ data: [], error: null })
    vi.mocked(signOut).mockResolvedValueOnce(undefined)
    const user = userEvent.setup()

    renderWithQueryClient(
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
    mockCategories({ data: [], error: null })
    vi.mocked(signOut).mockRejectedValueOnce(new Error('network error'))
    const user = userEvent.setup()

    renderWithQueryClient(
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

  it('renders Categories and Vocabulary menu triggers', () => {
    mockCategories({ data: [], error: null })

    renderWithQueryClient(
      <MemoryRouter>
        <NavBar />
      </MemoryRouter>,
    )

    expect(screen.getByRole('button', { name: /categories/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /vocabulary/i })).toBeInTheDocument()
  })

  it('lists topic categories in the Categories menu and navigates on selection', async () => {
    mockCategories({
      data: [
        { id: 'cat-1', category_name: 'Animals', is_vocabulary: false },
        { id: 'cat-2', category_name: 'Greetings', is_vocabulary: false },
      ],
      error: null,
    })
    const user = userEvent.setup()

    renderWithQueryClient(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<NavBar />} />
          <Route path="/flashcards/:deckType/:categoryId" element={<div>Mode select page</div>} />
        </Routes>
      </MemoryRouter>,
    )

    await openMenu(user, /categories/i)
    expect(await screen.findByRole('menuitem', { name: 'Animals' })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: 'Greetings' })).toBeInTheDocument()

    await user.click(screen.getByRole('menuitem', { name: 'Animals' }))
    expect(await screen.findByText('Mode select page')).toBeInTheDocument()
  })

  it('lists vocabulary categories in the Vocabulary menu, filtered separately from Categories', async () => {
    mockCategories({
      data: [{ id: 'cat-3', category_name: 'GCSE', is_vocabulary: true }],
      error: null,
    })
    const user = userEvent.setup()

    renderWithQueryClient(
      <MemoryRouter>
        <NavBar />
      </MemoryRouter>,
    )

    await openMenu(user, /vocabulary/i)

    expect(await screen.findByRole('menuitem', { name: 'GCSE' })).toBeInTheDocument()
  })

  it('shows an empty state when a menu has no categories', async () => {
    mockCategories({ data: [], error: null })
    const user = userEvent.setup()

    renderWithQueryClient(
      <MemoryRouter>
        <NavBar />
      </MemoryRouter>,
    )

    await openMenu(user, /categories/i)

    expect(await screen.findByText(/no categories yet/i)).toBeInTheDocument()
  })

  it('shows no Admin entry for a plain user', () => {
    mockCategories({ data: [], error: null })

    renderWithQueryClient(
      <MemoryRouter>
        <NavBar />
      </MemoryRouter>,
    )

    expect(screen.queryByText('Admin')).not.toBeInTheDocument()
  })

  it('shows a plain Admin link (not a dropdown) for an admin-only user', () => {
    mockCategories({ data: [], error: null })
    vi.mocked(useUserRoles).mockReturnValue({ isAdmin: true, isSuperadmin: false, loading: false })

    renderWithQueryClient(
      <MemoryRouter>
        <NavBar />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: 'Admin' })).toHaveAttribute('href', '/admin')
    expect(screen.queryByRole('button', { name: /admin/i })).not.toBeInTheDocument()
  })

  it('shows the full Admin dropdown with all 5 destinations for a superadmin', async () => {
    mockCategories({ data: [], error: null })
    vi.mocked(useUserRoles).mockReturnValue({ isAdmin: false, isSuperadmin: true, loading: false })
    const user = userEvent.setup()

    renderWithQueryClient(
      <MemoryRouter>
        <NavBar />
      </MemoryRouter>,
    )

    await openMenu(user, /^admin$/i)

    expect(screen.getByRole('menuitem', { name: /add & tag words/i })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: /manage categories/i })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: /manage words/i })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: /manage roles/i })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: /manage accounts/i })).toBeInTheDocument()
  })
})
