import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useUserRoles } from '../hooks/useUserRoles'
import { mockCategories } from '../test/mockCategories'
import { MobileNavSheet } from './MobileNavSheet'

vi.mock('../lib/supabase', () => ({
  supabase: {
    rpc: vi.fn(),
  },
}))

vi.mock('../hooks/useUserRoles', () => ({
  useUserRoles: vi.fn(),
}))

async function openSheet(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: /open menu/i }))
}

describe('MobileNavSheet', () => {
  beforeEach(() => {
    vi.mocked(useUserRoles).mockReturnValue({ isAdmin: false, isSuperadmin: false, loading: false })
  })

  it('opens on hamburger click and shows the nav links', async () => {
    mockCategories({ data: [], error: null })
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <MobileNavSheet onSignOut={vi.fn()} />
      </MemoryRouter>,
    )

    await openSheet(user)

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /create decks/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /my decks/i })).toBeInTheDocument()
  })

  it('expands the Categories disclosure and navigates to the selected category', async () => {
    mockCategories({
      data: [{ id: 'cat-1', category_name: 'Animals', is_vocabulary: false }],
      error: null,
    })
    const user = userEvent.setup()

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<MobileNavSheet onSignOut={vi.fn()} />} />
          <Route path="/flashcards/:deckType/:categoryId" element={<div>Mode select page</div>} />
        </Routes>
      </MemoryRouter>,
    )

    await openSheet(user)
    const trigger = screen.getByRole('button', { name: /categories/i })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')

    await user.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    const category = await screen.findByRole('link', { name: 'Animals' })

    await user.click(category)
    expect(await screen.findByText('Mode select page')).toBeInTheDocument()
  })

  it('shows an empty state when a disclosure has no categories', async () => {
    mockCategories({ data: [], error: null })
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <MobileNavSheet onSignOut={vi.fn()} />
      </MemoryRouter>,
    )

    await openSheet(user)
    await user.click(screen.getByRole('button', { name: /vocabulary/i }))

    expect(await screen.findByText(/no categories yet/i)).toBeInTheDocument()
  })

  it('calls onSignOut when Sign Out is clicked', async () => {
    mockCategories({ data: [], error: null })
    const onSignOut = vi.fn()
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <MobileNavSheet onSignOut={onSignOut} />
      </MemoryRouter>,
    )

    await openSheet(user)
    await user.click(screen.getByRole('button', { name: /sign out/i }))

    expect(onSignOut).toHaveBeenCalled()
  })

  it('closes the sheet after clicking a link', async () => {
    mockCategories({ data: [], error: null })
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <MobileNavSheet onSignOut={vi.fn()} />
      </MemoryRouter>,
    )

    await openSheet(user)
    await user.click(screen.getByRole('link', { name: /home/i }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('shows no Admin entry for a plain user', async () => {
    mockCategories({ data: [], error: null })
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <MobileNavSheet onSignOut={vi.fn()} />
      </MemoryRouter>,
    )

    await openSheet(user)

    expect(screen.queryByText('Admin')).not.toBeInTheDocument()
  })

  it('shows a plain Admin link for an admin-only user', async () => {
    mockCategories({ data: [], error: null })
    vi.mocked(useUserRoles).mockReturnValue({ isAdmin: true, isSuperadmin: false, loading: false })
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <MobileNavSheet onSignOut={vi.fn()} />
      </MemoryRouter>,
    )

    await openSheet(user)

    expect(screen.getByRole('link', { name: 'Admin' })).toHaveAttribute('href', '/admin')
  })

  it('expands the Admin disclosure with all 5 destinations for a superadmin', async () => {
    mockCategories({ data: [], error: null })
    vi.mocked(useUserRoles).mockReturnValue({ isAdmin: false, isSuperadmin: true, loading: false })
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <MobileNavSheet onSignOut={vi.fn()} />
      </MemoryRouter>,
    )

    await openSheet(user)
    await user.click(screen.getByRole('button', { name: /^admin$/i }))

    expect(screen.getByRole('link', { name: /add & tag words/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /manage categories/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /manage words/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /manage roles/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /manage accounts/i })).toBeInTheDocument()
  })
})
