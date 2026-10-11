import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { supabase } from '../lib/supabase'
import { CreateDeckPage } from './CreateDeckPage'

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
    rpc: vi.fn(),
  },
}))

const WORDS = [
  { id: 'word-1', word: 'Hello', definition: 'A greeting.' },
  { id: 'word-2', word: 'World', definition: 'The earth.' },
]

function mockWords() {
  vi.mocked(supabase.from).mockReturnValue({
    select: vi.fn().mockReturnValue({
      order: vi.fn().mockResolvedValue({ data: WORDS, error: null }),
    }),
  } as never)
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/create-decks']}>
      <Routes>
        <Route path="/create-decks" element={<CreateDeckPage />} />
        <Route path="/my-decks" element={<div>My Decks page</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('CreateDeckPage', () => {
  it('moves a word from the available list to the selected list on click', async () => {
    mockWords()
    const user = userEvent.setup()

    renderPage()

    await user.click(await screen.findByRole('button', { name: 'Hello' }))

    expect(screen.getByRole('status')).toHaveTextContent('1 word selected')
    expect(screen.queryByRole('button', { name: 'Hello' })).not.toBeInTheDocument()
  })

  it('exposes the word catalog and selected-words lists as labelled groups', async () => {
    mockWords()

    renderPage()
    await screen.findByRole('button', { name: 'Hello' })

    expect(screen.getByRole('group', { name: 'Word catalog' })).toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'Selected words' })).toBeInTheDocument()
  })

  it('filters the available list by search', async () => {
    mockWords()
    const user = userEvent.setup()

    renderPage()
    await screen.findByRole('button', { name: 'Hello' })

    await user.type(screen.getByPlaceholderText(/search words/i), 'wor')

    expect(screen.queryByRole('button', { name: 'Hello' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'World' })).toBeInTheDocument()
  })

  it('removes a selected word and returns it to the available list', async () => {
    mockWords()
    const user = userEvent.setup()

    renderPage()
    await user.click(await screen.findByRole('button', { name: 'Hello' }))
    await user.click(screen.getByRole('button', { name: /remove hello/i }))

    expect(screen.getByRole('status')).toHaveTextContent('0 words selected')
    expect(screen.getByRole('button', { name: 'Hello' })).toBeInTheDocument()
  })

  it('disables Confirm until at least one word is selected', async () => {
    mockWords()

    renderPage()
    await screen.findByRole('button', { name: 'Hello' })

    expect(screen.getByRole('button', { name: 'Confirm' })).toBeDisabled()
  })

  it('creates the deck and navigates to My Decks on success', async () => {
    mockWords()
    vi.mocked(supabase.rpc).mockResolvedValue({ data: 'new-deck-id', error: null } as never)
    const user = userEvent.setup()

    renderPage()
    await user.click(await screen.findByRole('button', { name: 'Hello' }))
    await user.click(screen.getByRole('button', { name: 'Confirm' }))

    const dialog = screen.getByRole('dialog')
    await user.type(within(dialog).getByPlaceholderText(/deck name/i), 'My Greetings')
    await user.click(within(dialog).getByRole('button', { name: 'Confirm' }))

    expect(supabase.rpc).toHaveBeenCalledWith('create_custom_deck', {
      p_name: 'My Greetings',
      p_word_ids: ['word-1'],
    })
    expect(await screen.findByText('My Decks page')).toBeInTheDocument()
  })

  it('shows an error message when deck creation fails', async () => {
    mockWords()
    vi.mocked(supabase.rpc).mockResolvedValue({ data: null, error: { message: 'boom' } } as never)
    const user = userEvent.setup()

    renderPage()
    await user.click(await screen.findByRole('button', { name: 'Hello' }))
    await user.click(screen.getByRole('button', { name: 'Confirm' }))

    const dialog = screen.getByRole('dialog')
    await user.type(within(dialog).getByPlaceholderText(/deck name/i), 'My Greetings')
    await user.click(within(dialog).getByRole('button', { name: 'Confirm' }))

    expect(await screen.findByText('boom')).toBeInTheDocument()
  })
})
