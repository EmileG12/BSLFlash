import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { supabase } from '../lib/supabase'
import { TenCardsPage } from './TenCardsPage'

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
    rpc: vi.fn(),
    storage: { from: vi.fn() },
  },
}))

const ROWS = [
  {
    word_id: 'word-1',
    word: 'Hello',
    definition: 'A greeting.',
    storage_path: 'hello/standard.mp4',
    format: 'mp4',
  },
  {
    word_id: 'word-2',
    word: 'World',
    definition: 'The earth.',
    storage_path: 'world/standard.mp4',
    format: 'mp4',
  },
]

const WORDS = [
  { id: 'word-1', word: 'Hello', definition: 'A greeting.' },
  { id: 'word-2', word: 'World', definition: 'The earth.' },
]

function mockBackend({ rpcData = ROWS }: { rpcData?: unknown[] } = {}) {
  vi.mocked(supabase.from).mockReturnValue({
    select: vi.fn().mockReturnValue({
      order: vi.fn().mockResolvedValue({ data: WORDS, error: null }),
    }),
  } as never)
  vi.mocked(supabase.rpc).mockResolvedValue({ data: rpcData, error: null } as never)
  vi.mocked(supabase.storage.from).mockReturnValue({
    getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'https://example.test/video.mp4' } }),
  } as never)
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/flashcards/cat-1/ten-cards']}>
      <Routes>
        <Route path="/flashcards/:categoryId/ten-cards" element={<TenCardsPage />} />
        <Route path="/flashcards/:categoryId" element={<div>Mode select page</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

async function answer(user: ReturnType<typeof userEvent.setup>, wordName: string) {
  await user.click(await screen.findByRole('combobox'))
  await user.click(await screen.findByRole('option', { name: wordName }))
  await user.click(screen.getByRole('button', { name: /confirm/i }))
}

describe('TenCardsPage', () => {
  it('shows a loading state before the round and words resolve', () => {
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({ order: vi.fn().mockReturnValue(new Promise(() => {})) }),
    } as never)
    vi.mocked(supabase.rpc).mockReturnValue(new Promise(() => {}) as never)

    renderPage()

    expect(screen.getByText(/loading flashcard/i)).toBeInTheDocument()
  })

  it('shows an error message when the round fails to load', async () => {
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

  it('shows "Next card" on the first of two cards, and "See results" on the last', async () => {
    mockBackend()
    const user = userEvent.setup()

    renderPage()

    await answer(user, 'Hello')
    expect(await screen.findByRole('button', { name: 'Next card' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Next card' }))
    await answer(user, 'World')
    expect(await screen.findByRole('button', { name: 'See results' })).toBeInTheDocument()
  })

  it('steps through the round and ends on a summary with the right score', async () => {
    mockBackend()
    const user = userEvent.setup()

    renderPage()

    await answer(user, 'Hello')
    await user.click(screen.getByRole('button', { name: 'Next card' }))

    await answer(user, 'Hello')
    await user.click(screen.getByRole('button', { name: 'See results' }))

    expect(await screen.findByText('You scored 1/2')).toBeInTheDocument()
  })

  it('"Back to modes" navigates to the mode select page for the category', async () => {
    mockBackend()
    const user = userEvent.setup()

    renderPage()

    await answer(user, 'Hello')
    await user.click(screen.getByRole('button', { name: 'Next card' }))
    await answer(user, 'World')
    await user.click(screen.getByRole('button', { name: 'See results' }))

    await user.click(await screen.findByRole('button', { name: /back to modes/i }))

    expect(await screen.findByText('Mode select page')).toBeInTheDocument()
  })

  it('reaches a summary instead of hanging when the category has fewer eligible words than requested', async () => {
    mockBackend({ rpcData: [ROWS[0]] })
    const user = userEvent.setup()

    renderPage()

    await answer(user, 'Hello')
    await user.click(await screen.findByRole('button', { name: 'See results' }))

    expect(await screen.findByText('You scored 1/1')).toBeInTheDocument()
  })
})
