import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { supabase } from '../lib/supabase'
import { FlashcardPage } from './FlashcardPage'

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
    rpc: vi.fn(),
    storage: { from: vi.fn() },
  },
}))

const FLASHCARD_ROW = {
  word_id: 'word-1',
  word: 'Hello',
  definition: 'A greeting.',
  storage_path: 'hello/standard.mp4',
  format: 'mp4',
}

const WORDS = [
  { id: 'word-1', word: 'Hello', definition: 'A greeting.' },
  { id: 'word-2', word: 'World', definition: 'The earth.' },
]

function mockBackend({ rpcData = [FLASHCARD_ROW] }: { rpcData?: unknown[] } = {}) {
  vi.mocked(supabase.from).mockReturnValue({
    select: vi.fn().mockReturnValue({
      order: vi.fn().mockResolvedValue({ data: WORDS, error: null }),
    }),
  } as never)
  vi.mocked(supabase.rpc).mockResolvedValue({ data: rpcData, error: null } as never)
  vi.mocked(supabase.storage.from).mockReturnValue({
    getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'https://example.test/hello.mp4' } }),
  } as never)
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/flashcards/cat-1/practice']}>
      <Routes>
        <Route path="/flashcards/:categoryId/practice" element={<FlashcardPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

// The score badge's numeric portion is a nested <span> (styled separately from the "Score:"
// label), so its full text isn't a single text node getByText can match directly.
function scoreBadgeText(container: HTMLElement) {
  return container.querySelector('.flashcard-score-badge')?.textContent?.replace(/\s+/g, ' ').trim()
}

describe('FlashcardPage', () => {
  it('shows a loading state before the flashcard and words resolve', () => {
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({ order: vi.fn().mockReturnValue(new Promise(() => {})) }),
    } as never)
    vi.mocked(supabase.rpc).mockReturnValue(new Promise(() => {}) as never)

    renderPage()

    expect(screen.getByText(/loading flashcard/i)).toBeInTheDocument()
  })

  it('shows an error message when the flashcard fails to load', async () => {
    mockBackend()
    vi.mocked(supabase.rpc).mockResolvedValue({ data: null, error: { message: 'boom' } } as never)

    renderPage()

    expect(await screen.findByText(/failed to load flashcard/i)).toBeInTheDocument()
  })

  it('shows an empty-state message when the category has no eligible words', async () => {
    mockBackend({ rpcData: [] })

    renderPage()

    expect(await screen.findByText(/no flashcards yet/i)).toBeInTheDocument()
  })

  it('renders FlashcardRound once loaded, and draws a new word on advance regardless of the guess', async () => {
    mockBackend()
    const user = userEvent.setup()

    renderPage()

    await user.click(await screen.findByRole('combobox'))
    await user.click(await screen.findByRole('option', { name: 'World' }))
    await user.click(screen.getByRole('button', { name: /confirm/i }))
    await screen.findByText(/incorrect\./i)

    expect(supabase.rpc).toHaveBeenCalledTimes(1)

    await user.click(screen.getByRole('button', { name: /next sign/i }))

    expect(await screen.findByRole('combobox')).toBeInTheDocument()
    expect(supabase.rpc).toHaveBeenCalledTimes(2)
  })

  it('tracks a consecutive-correct streak in the score pill, resetting on a wrong guess', async () => {
    mockBackend()
    const user = userEvent.setup()

    const { container } = renderPage()

    // The label/number are separate flex items with visual (not text) spacing between them —
    // see ScorePill — so there's no literal space in the rendered text.
    await screen.findByRole('combobox')
    expect(scoreBadgeText(container)).toBe('Score:0')

    // Correct guess (the flashcard's word is 'Hello', matching FLASHCARD_ROW's word_id).
    await user.click(screen.getByRole('combobox'))
    await user.click(await screen.findByRole('option', { name: 'Hello' }))
    await user.click(screen.getByRole('button', { name: /confirm/i }))
    await screen.findByText(/correct!/i)
    await user.click(screen.getByRole('button', { name: /next sign/i }))
    await screen.findByRole('combobox')

    expect(scoreBadgeText(container)).toBe('Score:1')

    // Wrong guess resets the streak back to 0.
    await user.click(screen.getByRole('combobox'))
    await user.click(await screen.findByRole('option', { name: 'World' }))
    await user.click(screen.getByRole('button', { name: /confirm/i }))
    await screen.findByText(/incorrect\./i)
    await user.click(screen.getByRole('button', { name: /next sign/i }))
    await screen.findByRole('combobox')

    expect(scoreBadgeText(container)).toBe('Score:0')
  })
})
