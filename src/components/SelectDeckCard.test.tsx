import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { mockCategories, mockCategoriesPending } from '../test/mockCategories'
import { SelectDeckCard } from './SelectDeckCard'

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}))

describe('SelectDeckCard', () => {
  it('shows a loading state before the categories resolve', () => {
    mockCategoriesPending()

    render(
      <MemoryRouter>
        <SelectDeckCard vocabulary={false} />
      </MemoryRouter>,
    )

    expect(screen.getByText(/loading categories/i)).toBeInTheDocument()
  })

  it('renders a button per category once loaded', async () => {
    mockCategories({
      data: [
        { id: '1', category_name: 'Animals', is_vocabulary: false },
        { id: '2', category_name: 'Greetings', is_vocabulary: false },
      ],
      error: null,
    })

    render(
      <MemoryRouter>
        <SelectDeckCard vocabulary={false} />
      </MemoryRouter>,
    )

    expect(await screen.findByRole('button', { name: 'Animals' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Greetings' })).toBeInTheDocument()
  })

  it('filters by the vocabulary prop', async () => {
    const { eq } = mockCategories({ data: [], error: null })

    render(
      <MemoryRouter>
        <SelectDeckCard vocabulary={true} />
      </MemoryRouter>,
    )

    await screen.findByText(/no categories yet/i)
    expect(eq).toHaveBeenCalledWith('is_vocabulary', true)
  })

  it('shows an error message when the fetch fails', async () => {
    mockCategories({ data: null, error: { message: 'network error' } })

    render(
      <MemoryRouter>
        <SelectDeckCard vocabulary={false} />
      </MemoryRouter>,
    )

    expect(await screen.findByText(/failed to load categories/i)).toBeInTheDocument()
  })

  it('shows an empty state when there are no categories', async () => {
    mockCategories({ data: [], error: null })

    render(
      <MemoryRouter>
        <SelectDeckCard vocabulary={false} />
      </MemoryRouter>,
    )

    expect(await screen.findByText(/no categories yet/i)).toBeInTheDocument()
  })

  it('renders a custom title when given one', async () => {
    mockCategories({ data: [], error: null })

    render(
      <MemoryRouter>
        <SelectDeckCard vocabulary={true} title="Select a vocabulary list" />
      </MemoryRouter>,
    )

    expect(screen.getByText('Select a vocabulary list')).toBeInTheDocument()
  })

  it('navigates to the flashcard page for the clicked category', async () => {
    mockCategories({
      data: [{ id: 'cat-1', category_name: 'Animals', is_vocabulary: false }],
      error: null,
    })
    const user = userEvent.setup()

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<SelectDeckCard vocabulary={false} />} />
          <Route path="/flashcards/:deckType/:categoryId" element={<div>Flashcard page</div>} />
        </Routes>
      </MemoryRouter>,
    )

    await user.click(await screen.findByRole('button', { name: 'Animals' }))

    expect(await screen.findByText('Flashcard page')).toBeInTheDocument()
  })
})
