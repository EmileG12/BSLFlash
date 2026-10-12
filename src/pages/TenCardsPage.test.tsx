import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { supabase } from '../lib/supabase'
import { renderWithQueryClient } from '../test/renderWithQueryClient'
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

function renderPage(initialEntry = '/flashcards/standard/cat-1/ten-cards') {
  return renderWithQueryClient(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/flashcards/:deckType/:categoryId/ten-cards" element={<TenCardsPage />} />
        <Route path="/flashcards/:deckType/:categoryId" element={<ModeSelectLocationProbe />} />
      </Routes>
    </MemoryRouter>,
  )
}

function ModeSelectLocationProbe() {
  const location = useLocation()
  return <div>Mode select page{location.search}</div>
}

async function answer(user: ReturnType<typeof userEvent.setup>, wordName: string) {
  await user.click(await screen.findByRole('combobox'))
  await user.click(await screen.findByRole('option', { name: wordName }))
  await user.click(screen.getByRole('button', { name: /confirm/i }))
}

// The score badge's numeric portions are nested <span>s (styled separately from the "Round:"/
// "Score:" labels), so its full text isn't a single text node getByText can match directly.
function scoreBadgeText(container: HTMLElement) {
  return container.querySelector('.flashcard-score-badge')?.textContent?.replace(/\s+/g, ' ').trim()
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

  it('forwards the subcategory query param to the RPC call, and preserves it on "Back to modes"', async () => {
    mockBackend()
    const user = userEvent.setup()

    renderPage('/flashcards/standard/cat-1/ten-cards?subcategory=sub-1')

    await answer(user, 'Hello')
    expect(supabase.rpc).toHaveBeenCalledWith('get_random_words_for_category', {
      category_id: 'cat-1',
      is_custom: false,
      subcategory_id: 'sub-1',
    })

    await user.click(screen.getByRole('button', { name: 'Next card' }))
    await answer(user, 'World')
    await user.click(screen.getByRole('button', { name: 'See results' }))

    await user.click(await screen.findByRole('button', { name: /back to modes/i }))

    expect(await screen.findByText('Mode select page?subcategory=sub-1')).toBeInTheDocument()
  })

  it('reaches a summary instead of hanging when the category has fewer eligible words than requested', async () => {
    mockBackend({ rpcData: [ROWS[0]] })
    const user = userEvent.setup()

    renderPage()

    await answer(user, 'Hello')
    await user.click(await screen.findByRole('button', { name: 'See results' }))

    expect(await screen.findByText('You scored 1/1')).toBeInTheDocument()
  })

  it('shows a Round/Score pill during play that updates as the round advances, and hides it on the summary', async () => {
    mockBackend()
    const user = userEvent.setup()

    const { container } = renderPage()

    // The divider between the Round and Score groups is a visual flex-gap/bar, not a text
    // character, so there's no literal space or "|" in the rendered text.
    await screen.findByRole('combobox')
    expect(scoreBadgeText(container)).toBe('Round:1/2Score:0/2')

    await answer(user, 'Hello')
    await user.click(screen.getByRole('button', { name: 'Next card' }))
    await screen.findByRole('combobox')

    expect(scoreBadgeText(container)).toBe('Round:2/2Score:1/2')

    await answer(user, 'World')
    await user.click(screen.getByRole('button', { name: 'See results' }))

    await screen.findByText('You scored 2/2')
    expect(container.querySelector('.flashcard-score-badge')).not.toBeInTheDocument()
  })
})
