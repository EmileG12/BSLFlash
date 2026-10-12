import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { supabase } from '../lib/supabase'
import { renderWithQueryClient } from '../test/renderWithQueryClient'
import { MyDecksPage } from './MyDecksPage'

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
    rpc: vi.fn(),
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } }),
    },
  },
}))

/**
 * Table-aware stub covering both MyDecksPage's own queries (custom_decks
 * list + delete, saved_decks delete) and whatever EditDeckModal fetches
 * once opened (custom_decks/custom_deck_words/custom_deck_tags detail,
 * categories, words) -- so clicking "Edit" doesn't crash on an
 * unanticipated chain shape, even though most of these tests never open it.
 */
function mockBackend(customDecks: { id: string; deck_name: string }[]) {
  vi.mocked(supabase.from).mockImplementation(
    (table: string) =>
      ({
        select: vi.fn().mockImplementation(() => {
          if (table === 'custom_decks') {
            return {
              eq: vi.fn().mockReturnValue({
                order: vi.fn().mockResolvedValue({ data: customDecks, error: null }),
                single: vi
                  .fn()
                  .mockResolvedValue({ data: { deck_name: customDecks[0]?.deck_name ?? '', is_public: false }, error: null }),
              }),
            }
          }
          if (table === 'custom_deck_words' || table === 'custom_deck_tags') {
            return { eq: vi.fn().mockResolvedValue({ data: [], error: null }) }
          }
          return { order: vi.fn().mockResolvedValue({ data: [], error: null }) }
        }),
        delete: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) }),
      }) as never,
  )
}

function mockSavedDecks(
  data: { id: string; deck_name: string; owner_user_id: string; owner_name: string | null }[],
) {
  vi.mocked(supabase.rpc).mockResolvedValue({ data, error: null } as never)
}

function renderPage() {
  return renderWithQueryClient(
    <MemoryRouter initialEntries={['/my-decks']}>
      <Routes>
        <Route path="/my-decks" element={<MyDecksPage />} />
        <Route path="/flashcards/custom/:categoryId" element={<div>Mode select page</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('MyDecksPage', () => {
  it('shows an empty state when the user has no custom decks or saved decks', async () => {
    mockBackend([])
    mockSavedDecks([])

    renderPage()

    expect(await screen.findByText(/haven't created any decks yet/i)).toBeInTheDocument()
    expect(await screen.findByText(/haven't saved any decks yet/i)).toBeInTheDocument()
  })

  it('renders a button per custom deck and navigates on selection', async () => {
    mockBackend([{ id: 'deck-1', deck_name: 'My Animals' }])
    mockSavedDecks([])
    const user = userEvent.setup()

    renderPage()

    await user.click(await screen.findByRole('button', { name: 'My Animals' }))

    expect(await screen.findByText('Mode select page')).toBeInTheDocument()
  })

  it('deletes a deck after confirming in the dialog', async () => {
    mockBackend([{ id: 'deck-1', deck_name: 'My Animals' }])
    mockSavedDecks([])
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
    mockBackend([{ id: 'deck-1', deck_name: 'My Animals' }])
    mockSavedDecks([])
    const user = userEvent.setup()

    renderPage()

    await user.click(await screen.findByRole('button', { name: /delete my animals/i }))
    await user.click(screen.getByRole('button', { name: /cancel/i }))

    expect(screen.getByRole('button', { name: 'My Animals' })).toBeInTheDocument()
  })

  it('opens the Edit deck modal for an owned deck', async () => {
    mockBackend([{ id: 'deck-1', deck_name: 'My Animals' }])
    mockSavedDecks([])
    const user = userEvent.setup()

    renderPage()

    await user.click(await screen.findByRole('button', { name: /edit my animals/i }))

    expect(await screen.findByRole('heading', { name: 'Edit deck' })).toBeInTheDocument()
  })

  it('does not offer an Edit button on saved decks', async () => {
    mockBackend([])
    mockSavedDecks([{ id: 'deck-2', deck_name: 'GCSE Pack', owner_user_id: 'user-2', owner_name: 'bob' }])

    renderPage()
    await screen.findByText('Saved Decks')

    expect(screen.queryByRole('button', { name: /edit gcse pack/i })).not.toBeInTheDocument()
  })

  it('renders saved decks in a separate section, with the owner shown', async () => {
    mockBackend([])
    mockSavedDecks([{ id: 'deck-2', deck_name: 'GCSE Pack', owner_user_id: 'user-2', owner_name: 'bob' }])

    renderPage()

    expect(screen.getByText('Saved Decks')).toBeInTheDocument()
    expect(await screen.findByRole('button', { name: 'GCSE Pack — by bob' })).toBeInTheDocument()
  })

  it('removes a saved deck after confirming in the dialog', async () => {
    mockBackend([])
    mockSavedDecks([{ id: 'deck-2', deck_name: 'GCSE Pack', owner_user_id: 'user-2', owner_name: 'bob' }])
    const user = userEvent.setup()

    renderPage()

    await user.click(await screen.findByRole('button', { name: /remove gcse pack/i }))
    expect(screen.getByText(/remove "gcse pack.*from my decks/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /^remove$/i }))

    await waitFor(() =>
      expect(screen.queryByRole('button', { name: /GCSE Pack/ })).not.toBeInTheDocument(),
    )
  })
})
