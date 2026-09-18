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
    <MemoryRouter initialEntries={['/flashcards/cat-1']}>
      <Routes>
        <Route path="/flashcards/:categoryId" element={<FlashcardPage />} />
      </Routes>
    </MemoryRouter>,
  )
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

  it('renders the video and combobox once loaded', async () => {
    mockBackend()

    renderPage()

    expect(await screen.findByRole('combobox')).toBeInTheDocument()
  })

  it('shows a correct message and the answer when the guess matches', async () => {
    mockBackend()
    const user = userEvent.setup()

    renderPage()

    await user.click(await screen.findByRole('combobox'))
    await user.click(await screen.findByText(/hello — a greeting/i))
    await user.click(screen.getByRole('button', { name: /confirm/i }))

    expect(await screen.findByText(/correct!/i)).toBeInTheDocument()
    expect(screen.getByText(/hello — a greeting/i)).toBeInTheDocument()
  })

  it('shows an incorrect message and the answer when the guess is wrong', async () => {
    mockBackend()
    const user = userEvent.setup()

    renderPage()

    await user.click(await screen.findByRole('combobox'))
    await user.click(await screen.findByText(/world — the earth/i))
    await user.click(screen.getByRole('button', { name: /confirm/i }))

    expect(await screen.findByText(/incorrect\./i)).toBeInTheDocument()
    expect(screen.getByText(/hello — a greeting/i)).toBeInTheDocument()
  })

  it('"Next sign" returns to guessing and draws a new word', async () => {
    mockBackend()
    const user = userEvent.setup()

    renderPage()

    await user.click(await screen.findByRole('combobox'))
    await user.click(await screen.findByText(/hello — a greeting/i))
    await user.click(screen.getByRole('button', { name: /confirm/i }))
    await screen.findByText(/correct!/i)

    expect(supabase.rpc).toHaveBeenCalledTimes(1)

    await user.click(screen.getByRole('button', { name: /next sign/i }))

    expect(await screen.findByRole('combobox')).toBeInTheDocument()
    expect(supabase.rpc).toHaveBeenCalledTimes(2)
  })

  it('shows an empty-state message when the category has no eligible words', async () => {
    mockBackend({ rpcData: [] })

    renderPage()

    expect(await screen.findByText(/no flashcards yet/i)).toBeInTheDocument()
  })
})
