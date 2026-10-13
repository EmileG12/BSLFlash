import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { supabase } from '../lib/supabase'
import { renderWithQueryClient } from '../test/renderWithQueryClient'
import { BrowseDecksPage } from './BrowseDecksPage'

vi.mock('../lib/supabase', () => ({
  supabase: {
    rpc: vi.fn(),
    from: vi.fn(),
  },
}))

const DECK = {
  id: 'deck-1',
  deck_name: 'My Animals',
  owner_user_id: 'user-1',
  owner_name: 'alice',
  tag_names: ['Animals'],
  like_count: 2,
  liked_by_me: false,
  saved_by_me: false,
  created_at: '2026-01-01T00:00:00Z',
}

function mockRpc(decks: typeof DECK[]) {
  vi.mocked(supabase.rpc).mockImplementation(((fn: string) => {
    if (fn === 'get_available_deck_tags') {
      return Promise.resolve({ data: [], error: null })
    }
    return Promise.resolve({ data: decks, error: null })
  }) as never)
}

function mockMutation() {
  const deleteEq = vi.fn().mockResolvedValue({ error: null })
  const insert = vi.fn().mockResolvedValue({ error: null })
  vi.mocked(supabase.from).mockReturnValue({
    delete: vi.fn().mockReturnValue({ eq: deleteEq }),
    insert,
  } as never)
  return { deleteEq, insert }
}

function renderPage() {
  return renderWithQueryClient(
    <MemoryRouter initialEntries={['/browse-decks']}>
      <Routes>
        <Route path="/browse-decks" element={<BrowseDecksPage />} />
        <Route path="/flashcards/:deckType/:categoryId" element={<div>Mode select page</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('BrowseDecksPage', () => {
  it('shows an empty state when there are no public decks', async () => {
    mockRpc([])

    renderPage()

    expect(await screen.findByText(/no public decks match your search/i)).toBeInTheDocument()
  })

  it('renders a deck with its owner and tags', async () => {
    mockRpc([DECK])

    renderPage()

    expect(await screen.findByText('My Animals')).toBeInTheDocument()
    expect(screen.getByText(/by alice/i)).toBeInTheDocument()
    expect(screen.getByText(/by alice.*Animals/)).toBeInTheDocument()
  })

  it('navigates to the deck when Play is clicked', async () => {
    mockRpc([DECK])
    const user = userEvent.setup()

    renderPage()

    await user.click(await screen.findByRole('button', { name: 'Play My Animals' }))

    expect(await screen.findByText('Mode select page')).toBeInTheDocument()
  })

  it('does not navigate when the deck name is clicked', async () => {
    mockRpc([DECK])
    const user = userEvent.setup()

    renderPage()

    await user.click(await screen.findByText('My Animals'))

    expect(screen.queryByText('Mode select page')).not.toBeInTheDocument()
  })

  it('re-fetches with the typed search term', async () => {
    mockRpc([DECK])
    const user = userEvent.setup()

    renderPage()
    await screen.findByText('My Animals')

    await user.type(screen.getByPlaceholderText(/search decks/i), 'gcse')

    await waitFor(() =>
      expect(supabase.rpc).toHaveBeenCalledWith('get_public_decks', {
        p_search: 'gcse',
        p_tag_ids: undefined,
        p_sort: 'likes',
      }),
    )
  })

  it('re-fetches with the selected sort', async () => {
    mockRpc([DECK])
    const user = userEvent.setup()

    renderPage()
    await screen.findByText('My Animals')

    await user.click(screen.getByRole('button', { name: 'Newest' }))

    await waitFor(() =>
      expect(supabase.rpc).toHaveBeenCalledWith('get_public_decks', {
        p_search: undefined,
        p_tag_ids: undefined,
        p_sort: 'newest',
      }),
    )
    expect(screen.getByRole('button', { name: 'Newest' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('likes a deck and increments the count optimistically', async () => {
    mockRpc([DECK])
    const { insert } = mockMutation()
    const user = userEvent.setup()

    renderPage()
    await screen.findByText('My Animals')

    await user.click(screen.getByRole('button', { name: 'Like My Animals' }))

    expect(screen.getByRole('button', { name: 'Unlike My Animals' })).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(insert).toHaveBeenCalledWith({ custom_deck_id: 'deck-1' })
  })

  it('saves a deck to the library', async () => {
    mockRpc([DECK])
    const { insert } = mockMutation()
    const user = userEvent.setup()

    renderPage()
    await screen.findByText('My Animals')

    const saveButton = screen.getByRole('button', { name: 'Add My Animals to My Decks' })
    expect(saveButton.querySelector('svg')).not.toHaveClass('text-success')

    await user.click(saveButton)

    const savedButton = screen.getByRole('button', { name: 'Remove My Animals from My Decks' })
    expect(savedButton).toBeInTheDocument()
    expect(savedButton.querySelector('svg')).toHaveClass('fill-current', 'text-success')
    expect(insert).toHaveBeenCalledWith({ custom_deck_id: 'deck-1' })
  })
})
