import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { FlashcardRound } from './FlashcardRound'
import type { Flashcard } from '../hooks/useRandomFlashcard'
import type { WordOption } from '../hooks/useWords'

const FLASHCARD: Flashcard = {
  wordId: 'word-1',
  word: 'Hello',
  definition: 'A greeting.',
  videoUrl: 'https://example.test/hello.mp4',
}

const WORDS: WordOption[] = [
  { id: 'word-1', word: 'Hello', definition: 'A greeting.' },
  { id: 'word-2', word: 'World', definition: 'The earth.' },
]

describe('FlashcardRound', () => {
  it('renders the video and combobox for the given flashcard', () => {
    render(
      <FlashcardRound flashcard={FLASHCARD} words={WORDS} advanceLabel="Next sign" onAdvance={vi.fn()} />,
    )

    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('shows a correct message and calls onAdvance with the right result when the guess matches', async () => {
    const onAdvance = vi.fn()
    const user = userEvent.setup()

    render(
      <FlashcardRound flashcard={FLASHCARD} words={WORDS} advanceLabel="Next sign" onAdvance={onAdvance} />,
    )

    await user.click(screen.getByRole('combobox'))
    await user.click(await screen.findByRole('option', { name: 'Hello' }))
    await user.click(screen.getByRole('button', { name: /confirm/i }))

    expect(await screen.findByText(/correct!/i)).toBeInTheDocument()
    expect(screen.getByText(/hello — a greeting/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Next sign' }))
    expect(onAdvance).toHaveBeenCalledWith({ wordId: 'word-1', correct: true })
  })

  it('shows an incorrect message and calls onAdvance with correct: false when the guess is wrong', async () => {
    const onAdvance = vi.fn()
    const user = userEvent.setup()

    render(
      <FlashcardRound flashcard={FLASHCARD} words={WORDS} advanceLabel="Next sign" onAdvance={onAdvance} />,
    )

    await user.click(screen.getByRole('combobox'))
    await user.click(await screen.findByRole('option', { name: 'World' }))
    await user.click(screen.getByRole('button', { name: /confirm/i }))

    expect(await screen.findByText(/incorrect\./i)).toBeInTheDocument()
    expect(screen.getByText(/hello — a greeting/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Next sign' }))
    expect(onAdvance).toHaveBeenCalledWith({ wordId: 'word-1', correct: false })
  })

  it('renders the given advanceLabel on the reveal button', async () => {
    const user = userEvent.setup()

    render(
      <FlashcardRound flashcard={FLASHCARD} words={WORDS} advanceLabel="See results" onAdvance={vi.fn()} />,
    )

    await user.click(screen.getByRole('combobox'))
    await user.click(await screen.findByRole('option', { name: 'Hello' }))
    await user.click(screen.getByRole('button', { name: /confirm/i }))

    expect(await screen.findByRole('button', { name: 'See results' })).toBeInTheDocument()
  })

  it('returns to the guessing combobox after advancing', async () => {
    const user = userEvent.setup()

    render(
      <FlashcardRound flashcard={FLASHCARD} words={WORDS} advanceLabel="Next sign" onAdvance={vi.fn()} />,
    )

    await user.click(screen.getByRole('combobox'))
    await user.click(await screen.findByRole('option', { name: 'Hello' }))
    await user.click(screen.getByRole('button', { name: /confirm/i }))
    await user.click(await screen.findByRole('button', { name: 'Next sign' }))

    expect(await screen.findByRole('combobox')).toBeInTheDocument()
  })

  it('advances on Enter once revealed, same as clicking the advance button', async () => {
    const onAdvance = vi.fn()
    const user = userEvent.setup()

    render(
      <FlashcardRound flashcard={FLASHCARD} words={WORDS} advanceLabel="Next sign" onAdvance={onAdvance} />,
    )

    await user.click(screen.getByRole('combobox'))
    await user.click(await screen.findByRole('option', { name: 'Hello' }))
    await user.click(screen.getByRole('button', { name: /confirm/i }))
    await screen.findByText(/correct!/i)

    await user.keyboard('{Enter}')

    expect(onAdvance).toHaveBeenCalledWith({ wordId: 'word-1', correct: true })
    expect(await screen.findByRole('combobox')).toBeInTheDocument()
  })
})
