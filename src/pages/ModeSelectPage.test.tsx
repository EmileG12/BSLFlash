import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { supabase } from '../lib/supabase'
import { renderWithQueryClient } from '../test/renderWithQueryClient'
import { ModeSelectPage } from './ModeSelectPage'

function PracticeLocationProbe() {
  const location = useLocation()
  return <div>Practice page{location.search}</div>
}

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
    rpc: vi.fn(),
  },
}))

function mockCategory(data: { category_name: string; is_vocabulary?: boolean } | null) {
  vi.mocked(supabase.from).mockReturnValue({
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        maybeSingle: vi.fn().mockResolvedValue({ data, error: null }),
      }),
    }),
  } as never)
}

function mockSubcategories(data: { id: string; category_name: string }[]) {
  vi.mocked(supabase.rpc).mockResolvedValue({ data, error: null } as never)
}

function renderPage(initialEntry = '/flashcards/standard/cat-1') {
  return renderWithQueryClient(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/flashcards/:deckType/:categoryId" element={<ModeSelectPage />} />
        <Route path="/flashcards/:deckType/:categoryId/practice" element={<div>Practice page</div>} />
        <Route path="/flashcards/:deckType/:categoryId/ten-cards" element={<div>Ten Cards page</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('ModeSelectPage', () => {
  it('renders Practice and 10 Cards buttons', async () => {
    mockCategory({ category_name: 'Greetings', is_vocabulary: false })
    renderPage()

    expect(await screen.findByRole('button', { name: 'Practice' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '10 Cards' })).toBeInTheDocument()
  })

  it('navigates to the practice route for the category', async () => {
    mockCategory({ category_name: 'Greetings', is_vocabulary: false })
    const user = userEvent.setup()
    renderPage()

    await user.click(await screen.findByRole('button', { name: 'Practice' }))

    expect(await screen.findByText('Practice page')).toBeInTheDocument()
  })

  it('navigates to the ten-cards route for the category', async () => {
    mockCategory({ category_name: 'Greetings', is_vocabulary: false })
    const user = userEvent.setup()
    renderPage()

    await user.click(await screen.findByRole('button', { name: '10 Cards' }))

    expect(await screen.findByText('Ten Cards page')).toBeInTheDocument()
  })

  it('shows an error instead of mode buttons for an unrecognized deckType', () => {
    renderWithQueryClient(
      <MemoryRouter initialEntries={['/flashcards/bogus/cat-1']}>
        <Routes>
          <Route path="/flashcards/:deckType/:categoryId" element={<ModeSelectPage />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText(/no category selected/i)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Practice' })).not.toBeInTheDocument()
  })

  it('shows no subcategory section for a non-vocabulary category', async () => {
    mockCategory({ category_name: 'Greetings', is_vocabulary: false })
    renderPage()

    await screen.findByRole('button', { name: 'Practice' })
    expect(screen.queryByText(/narrow by topic/i)).not.toBeInTheDocument()
  })

  it('shows no subcategory section for a custom deck', async () => {
    mockCategory({ category_name: 'My Deck' })
    renderPage('/flashcards/custom/deck-1')

    await screen.findByRole('button', { name: 'Practice' })
    expect(screen.queryByText(/narrow by topic/i)).not.toBeInTheDocument()
  })

  it('shows the subcategory section with "All" pre-selected for a vocabulary category', async () => {
    mockCategory({ category_name: 'GCSE', is_vocabulary: true })
    mockSubcategories([{ id: 'sub-1', category_name: 'Colours' }])
    renderPage()

    expect(await screen.findByText(/narrow by topic/i)).toBeInTheDocument()
    expect(await screen.findByRole('button', { name: 'Colours' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'All' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('navigates without a query string when "All" is selected', async () => {
    mockCategory({ category_name: 'GCSE', is_vocabulary: true })
    mockSubcategories([{ id: 'sub-1', category_name: 'Colours' }])
    const user = userEvent.setup()

    renderWithQueryClient(
      <MemoryRouter initialEntries={['/flashcards/standard/cat-1']}>
        <Routes>
          <Route path="/flashcards/:deckType/:categoryId" element={<ModeSelectPage />} />
          <Route path="/flashcards/:deckType/:categoryId/practice" element={<PracticeLocationProbe />} />
        </Routes>
      </MemoryRouter>,
    )

    await user.click(await screen.findByRole('button', { name: 'Practice' }))

    expect(await screen.findByText('Practice page')).toBeInTheDocument()
  })

  it('appends ?subcategory= to mode navigation once a subcategory is picked', async () => {
    mockCategory({ category_name: 'GCSE', is_vocabulary: true })
    mockSubcategories([{ id: 'sub-1', category_name: 'Colours' }])
    const user = userEvent.setup()

    renderWithQueryClient(
      <MemoryRouter initialEntries={['/flashcards/standard/cat-1']}>
        <Routes>
          <Route path="/flashcards/:deckType/:categoryId" element={<ModeSelectPage />} />
          <Route path="/flashcards/:deckType/:categoryId/practice" element={<PracticeLocationProbe />} />
        </Routes>
      </MemoryRouter>,
    )

    await user.click(await screen.findByRole('button', { name: 'Colours' }))
    await user.click(screen.getByRole('button', { name: 'Practice' }))

    expect(await screen.findByText('Practice page?subcategory=sub-1')).toBeInTheDocument()
  })

  it('pre-selects the subcategory given in the URL', async () => {
    mockCategory({ category_name: 'GCSE', is_vocabulary: true })
    mockSubcategories([{ id: 'sub-1', category_name: 'Colours' }])
    renderPage('/flashcards/standard/cat-1?subcategory=sub-1')

    expect(await screen.findByRole('button', { name: 'Colours' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'All' })).toHaveAttribute('aria-pressed', 'false')
  })
})
