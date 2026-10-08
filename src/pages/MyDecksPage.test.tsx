import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { supabase } from '../lib/supabase'
import { MyDecksPage } from './MyDecksPage'

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}))

function mockCustomCategories(data: { id: string; category_name: string }[]) {
  vi.mocked(supabase.from).mockImplementation(
    () =>
      ({
        select: vi.fn().mockReturnValue({ order: vi.fn().mockResolvedValue({ data, error: null }) }),
        delete: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) }),
      }) as never,
  )
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/my-decks']}>
      <Routes>
        <Route path="/my-decks" element={<MyDecksPage />} />
        <Route path="/flashcards/custom/:categoryId" element={<div>Mode select page</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('MyDecksPage', () => {
  it('shows an empty state when the user has no custom decks', async () => {
    mockCustomCategories([])

    renderPage()

    expect(await screen.findByText(/haven't created any decks yet/i)).toBeInTheDocument()
  })

  it('renders a button per custom deck and navigates on selection', async () => {
    mockCustomCategories([{ id: 'deck-1', category_name: 'My Animals' }])
    const user = userEvent.setup()

    renderPage()

    await user.click(await screen.findByRole('button', { name: 'My Animals' }))

    expect(await screen.findByText('Mode select page')).toBeInTheDocument()
  })

  it('deletes a deck after confirming in the dialog', async () => {
    mockCustomCategories([{ id: 'deck-1', category_name: 'My Animals' }])
    const user = userEvent.setup()

    renderPage()

    await user.click(await screen.findByRole('button', { name: /delete my animals/i }))
    expect(screen.getByText(/delete "my animals"/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /^delete$/i }))

    await waitFor(() =>
      expect(screen.queryByRole('button', { name: 'My Animals' })).not.toBeInTheDocument(),
    )
  })

  it('keeps the deck when the delete dialog is cancelled', async () => {
    mockCustomCategories([{ id: 'deck-1', category_name: 'My Animals' }])
    const user = userEvent.setup()

    renderPage()

    await user.click(await screen.findByRole('button', { name: /delete my animals/i }))
    await user.click(screen.getByRole('button', { name: /cancel/i }))

    expect(screen.getByRole('button', { name: 'My Animals' })).toBeInTheDocument()
  })
})
