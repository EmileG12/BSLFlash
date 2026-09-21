import { render, screen } from '@testing-library/react'
import { userEvent } from 'vitest/browser'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { mockCategories } from '../test/mockCategories'
import { NavBar } from './NavBar'

vi.mock('../lib/auth', () => ({
  signOut: vi.fn(),
}))

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}))

/**
 * Runs in real Chromium (`npx vitest run --project=browser`) rather than jsdom.
 *
 * Opening a Radix menu with the mouse can't be covered in jsdom: Radix relies on
 * the open menu setting `pointer-events: none` on <body>, which makes the trigger
 * un-hit-testable so the browser never delivers the trailing `click` to it. jsdom
 * has no hit-testing, so that click lands on the trigger anyway and toggles the
 * menu straight back shut. `userEvent` from `vitest/browser` is Playwright's real
 * input driver (note: NOT @testing-library/user-event, which dispatches synthetic
 * events at a named element and would reproduce the same behavior in Chromium).
 *
 * Keep this file to behavior that genuinely needs a browser. Menu contents,
 * category filtering, navigation and loading/empty states are cheaper to cover in
 * jsdom and live in NavBar.test.tsx.
 */
describe('NavBar in a real browser', () => {
  it('opens the Categories menu when the trigger is clicked', async () => {
    mockCategories({
      data: [
        { id: 'cat-1', category_name: 'Animals', is_vocabulary: false },
        { id: 'cat-2', category_name: 'Greetings', is_vocabulary: false },
      ],
      error: null,
    })

    render(
      <MemoryRouter>
        <NavBar />
      </MemoryRouter>,
    )

    await userEvent.click(screen.getByRole('button', { name: /categories/i }))

    expect(await screen.findByRole('menuitem', { name: 'Animals' })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: 'Greetings' })).toBeInTheDocument()
  })

  it('navigates to the mode select page for a clicked category', async () => {
    mockCategories({
      data: [{ id: 'cat-1', category_name: 'Animals', is_vocabulary: false }],
      error: null,
    })

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<NavBar />} />
          <Route path="/flashcards/:categoryId" element={<div>Mode select page</div>} />
        </Routes>
      </MemoryRouter>,
    )

    await userEvent.click(screen.getByRole('button', { name: /categories/i }))
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Animals' }))

    expect(await screen.findByText('Mode select page')).toBeInTheDocument()
  })

  it('opens the Vocabulary menu independently of the Categories menu', async () => {
    mockCategories({
      data: [{ id: 'cat-3', category_name: 'GCSE', is_vocabulary: true }],
      error: null,
    })

    render(
      <MemoryRouter>
        <NavBar />
      </MemoryRouter>,
    )

    await userEvent.click(screen.getByRole('button', { name: /vocabulary/i }))

    expect(await screen.findByRole('menuitem', { name: 'GCSE' })).toBeInTheDocument()
  })
})
