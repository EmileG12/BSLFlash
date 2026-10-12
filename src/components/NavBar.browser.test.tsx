import { screen } from '@testing-library/react'
import { userEvent } from 'vitest/browser'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
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
 * Runs in real Chromium (`npx vitest run --project=browser`) rather than jsdom.
 *
 * The Categories/Vocabulary menus open on hover, not click (the trigger's own
 * pointerdown-to-toggle is deliberately suppressed in NavBar.tsx so mouse clicks
 * can't fight with the hover-driven open state). Hover relies on real mouse
 * movement and hit-testing, which jsdom doesn't do, so it can't be covered there.
 * `userEvent` from `vitest/browser` is Playwright's real input driver (note: NOT
 * @testing-library/user-event, which dispatches synthetic events at a named
 * element and wouldn't move a real pointer).
 *
 * Keep this file to behavior that genuinely needs a browser. Menu contents,
 * category filtering, navigation and loading/empty states are cheaper to cover in
 * jsdom and live in NavBar.test.tsx.
 */
describe('NavBar in a real browser', () => {
  beforeEach(() => {
    vi.mocked(useUserRoles).mockReturnValue({ isAdmin: false, isSuperadmin: false, loading: false })
  })

  it('opens the Categories menu when the trigger is hovered', async () => {
    mockCategories({
      data: [
        { id: 'cat-1', category_name: 'Animals', is_vocabulary: false },
        { id: 'cat-2', category_name: 'Greetings', is_vocabulary: false },
      ],
      error: null,
    })

    renderWithQueryClient(
      <MemoryRouter>
        <NavBar />
      </MemoryRouter>,
    )

    await userEvent.hover(screen.getByRole('button', { name: /categories/i }))

    expect(await screen.findByRole('menuitem', { name: 'Animals' })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: 'Greetings' })).toBeInTheDocument()
  })

  it('navigates to the mode select page for a clicked category', async () => {
    mockCategories({
      data: [{ id: 'cat-1', category_name: 'Animals', is_vocabulary: false }],
      error: null,
    })

    renderWithQueryClient(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<NavBar />} />
          <Route path="/flashcards/:deckType/:categoryId" element={<div>Mode select page</div>} />
        </Routes>
      </MemoryRouter>,
    )

    await userEvent.hover(screen.getByRole('button', { name: /categories/i }))
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Animals' }))

    expect(await screen.findByText('Mode select page')).toBeInTheDocument()
  })

  it('opens the Vocabulary menu independently of the Categories menu', async () => {
    mockCategories({
      data: [{ id: 'cat-3', category_name: 'GCSE', is_vocabulary: true }],
      error: null,
    })

    renderWithQueryClient(
      <MemoryRouter>
        <NavBar />
      </MemoryRouter>,
    )

    await userEvent.hover(screen.getByRole('button', { name: /vocabulary/i }))

    expect(await screen.findByRole('menuitem', { name: 'GCSE' })).toBeInTheDocument()
  })

  it('closes the menu when the pointer moves away without entering it', async () => {
    mockCategories({
      data: [{ id: 'cat-1', category_name: 'Animals', is_vocabulary: false }],
      error: null,
    })

    renderWithQueryClient(
      <MemoryRouter>
        <NavBar />
      </MemoryRouter>,
    )

    await userEvent.hover(screen.getByRole('button', { name: /categories/i }))
    await screen.findByRole('menuitem', { name: 'Animals' })

    await userEvent.hover(screen.getByRole('button', { name: /sign out/i }))

    await expect
      .poll(() => screen.queryByRole('menuitem', { name: 'Animals' }), { timeout: 1000 })
      .not.toBeInTheDocument()
  })

  it('opens the Admin menu when the trigger is hovered, for a superadmin', async () => {
    mockCategories({ data: [], error: null })
    vi.mocked(useUserRoles).mockReturnValue({ isAdmin: false, isSuperadmin: true, loading: false })

    renderWithQueryClient(
      <MemoryRouter>
        <NavBar />
      </MemoryRouter>,
    )

    await userEvent.hover(screen.getByRole('button', { name: /^admin$/i }))

    expect(await screen.findByRole('menuitem', { name: /add & tag words/i })).toBeInTheDocument()
  })
})
