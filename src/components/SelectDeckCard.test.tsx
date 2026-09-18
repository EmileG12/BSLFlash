import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { supabase } from '../lib/supabase'
import { SelectDeckCard } from './SelectDeckCard'

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}))

function mockCategories(result: { data?: unknown; error?: unknown }) {
  vi.mocked(supabase.from).mockReturnValue({
    select: vi.fn().mockReturnValue({
      order: vi.fn().mockResolvedValue(result),
    }),
  } as never)
}

describe('SelectDeckCard', () => {
  it('shows a loading state before the categories resolve', () => {
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockReturnValue(new Promise(() => {})),
      }),
    } as never)

    render(
      <MemoryRouter>
        <SelectDeckCard />
      </MemoryRouter>,
    )

    expect(screen.getByText(/loading categories/i)).toBeInTheDocument()
  })

  it('renders a button per category once loaded', async () => {
    mockCategories({
      data: [
        { id: '1', category_name: 'Animals' },
        { id: '2', category_name: 'Greetings' },
      ],
      error: null,
    })

    render(
      <MemoryRouter>
        <SelectDeckCard />
      </MemoryRouter>,
    )

    expect(await screen.findByRole('button', { name: 'Animals' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Greetings' })).toBeInTheDocument()
  })

  it('shows an error message when the fetch fails', async () => {
    mockCategories({ data: null, error: { message: 'network error' } })

    render(
      <MemoryRouter>
        <SelectDeckCard />
      </MemoryRouter>,
    )

    expect(await screen.findByText(/failed to load categories/i)).toBeInTheDocument()
  })

  it('shows an empty state when there are no categories', async () => {
    mockCategories({ data: [], error: null })

    render(
      <MemoryRouter>
        <SelectDeckCard />
      </MemoryRouter>,
    )

    expect(await screen.findByText(/no categories yet/i)).toBeInTheDocument()
  })

  it('navigates to the flashcard page for the clicked category', async () => {
    mockCategories({
      data: [{ id: 'cat-1', category_name: 'Animals' }],
      error: null,
    })
    const user = userEvent.setup()

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<SelectDeckCard />} />
          <Route path="/flashcards/:categoryId" element={<div>Flashcard page</div>} />
        </Routes>
      </MemoryRouter>,
    )

    await user.click(await screen.findByRole('button', { name: 'Animals' }))

    expect(await screen.findByText('Flashcard page')).toBeInTheDocument()
  })
})
