import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { supabase } from '../lib/supabase'
import { EditDeckModal } from './EditDeckModal'

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
    rpc: vi.fn(),
  },
}))

function mockBackend() {
  vi.mocked(supabase.from).mockImplementation(
    (table: string) =>
      ({
        select: vi.fn().mockImplementation(() => {
          if (table === 'custom_decks') {
            return {
              eq: vi.fn().mockReturnValue({
                single: vi
                  .fn()
                  .mockResolvedValue({ data: { deck_name: 'My Animals', is_public: false }, error: null }),
              }),
            }
          }
          if (table === 'custom_deck_words') {
            return { eq: vi.fn().mockResolvedValue({ data: [{ word_id: 'word-1' }], error: null }) }
          }
          if (table === 'custom_deck_tags') {
            return { eq: vi.fn().mockResolvedValue({ data: [{ category_id: 'tag-1' }], error: null }) }
          }
          if (table === 'categories') {
            return {
              order: vi
                .fn()
                .mockResolvedValue({ data: [{ id: 'tag-1', category_name: 'GCSE' }], error: null }),
            }
          }
          // words
          return {
            order: vi.fn().mockResolvedValue({
              data: [
                { id: 'word-1', word: 'Hello', definition: 'A greeting.' },
                { id: 'word-2', word: 'World', definition: 'The earth.' },
              ],
              error: null,
            }),
          }
        }),
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({ in: vi.fn().mockResolvedValue({ error: null }) }),
        }),
        insert: vi.fn().mockResolvedValue({ error: null }),
      }) as never,
  )
  vi.mocked(supabase.rpc).mockResolvedValue({ error: null } as never)
}

describe('EditDeckModal', () => {
  it('shows a loading state before the deck detail resolves', () => {
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({ single: vi.fn().mockReturnValue(new Promise(() => {})) }),
      }),
    } as never)

    render(<EditDeckModal deckId="deck-1" onClose={vi.fn()} onSaved={vi.fn()} />)

    expect(screen.getByText(/loading deck/i)).toBeInTheDocument()
  })

  it('pre-fills the name, publish state, words, and tags from the deck detail', async () => {
    mockBackend()

    render(<EditDeckModal deckId="deck-1" onClose={vi.fn()} onSaved={vi.fn()} />)

    expect(await screen.findByDisplayValue('My Animals')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Unpublished' })).toBeInTheDocument()
    expect(await screen.findByRole('button', { name: 'GCSE' })).toHaveAttribute('aria-pressed', 'true')
    expect(await screen.findByText('Hello')).toBeInTheDocument()
  })

  it('toggles publish immediately via set_custom_deck_public', async () => {
    mockBackend()
    const user = userEvent.setup()

    render(<EditDeckModal deckId="deck-1" onClose={vi.fn()} onSaved={vi.fn()} />)
    await screen.findByDisplayValue('My Animals')

    await user.click(screen.getByRole('button', { name: 'Unpublished' }))

    expect(supabase.rpc).toHaveBeenCalledWith('set_custom_deck_public', {
      p_deck_id: 'deck-1',
      p_is_public: true,
    })
    expect(await screen.findByRole('button', { name: 'Published' })).toBeInTheDocument()
  })

  it('saves the rename and word list, then calls onSaved and onClose', async () => {
    mockBackend()
    const onSaved = vi.fn()
    const onClose = vi.fn()
    const user = userEvent.setup()

    render(<EditDeckModal deckId="deck-1" onClose={onClose} onSaved={onSaved} />)
    await screen.findByDisplayValue('My Animals')

    const nameInput = screen.getByLabelText('Deck name')
    await user.clear(nameInput)
    await user.type(nameInput, 'My Pets')

    await user.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() =>
      expect(supabase.rpc).toHaveBeenCalledWith('update_custom_deck', {
        p_deck_id: 'deck-1',
        p_name: 'My Pets',
        p_word_ids: ['word-1'],
      }),
    )
    expect(onSaved).toHaveBeenCalledWith('deck-1', 'My Pets')
    expect(onClose).toHaveBeenCalled()
  })

  it('calls onClose when Cancel is clicked', async () => {
    mockBackend()
    const onClose = vi.fn()
    const user = userEvent.setup()

    render(<EditDeckModal deckId="deck-1" onClose={onClose} onSaved={vi.fn()} />)
    await screen.findByDisplayValue('My Animals')

    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(onClose).toHaveBeenCalled()
  })
})
