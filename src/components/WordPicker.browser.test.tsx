import { render, screen } from '@testing-library/react'
import { userEvent } from 'vitest/browser'
import { describe, expect, it, vi } from 'vitest'
import '../index.css'
import { WordPicker } from './WordPicker'

const WORDS = [
  { id: 'word-1', word: 'Hello', definition: 'A greeting.' },
  { id: 'word-2', word: 'World', definition: 'The earth.' },
]

/**
 * Runs in real Chromium (`npx vitest run --project=browser`) rather than jsdom.
 *
 * Switching from one open definition popover straight to another relies on
 * Radix's pointerdown-outside dismissal racing against the next trigger's own
 * click in real event order. In jsdom, userEvent's synthetic click lets the
 * dismissal consume the event that would have opened the new popover, so the
 * first click only closes the old one and a second click is needed -- that
 * doesn't happen with real pointer events in a browser. Keep this file to that
 * one interaction; the rest of WordPicker's popover behavior is cheaper to
 * cover in jsdom and lives in WordPicker.test.tsx.
 *
 * The real-app behavior this guards against only happens because the
 * definition popover's styling (including the pointer-events rule that lets
 * clicks reach a sibling row underneath it) ships via src/index.css, which is
 * normally pulled in once by main.tsx. Rendering WordPicker in isolation here
 * skips that import chain, so it's imported directly below.
 */
describe('WordPicker in a real browser', () => {
  it('closes a previously open definition popover when a different one is opened', async () => {
    render(
      <WordPicker
        words={WORDS}
        loading={false}
        error={null}
        selectedIds={[]}
        onAdd={vi.fn()}
        onRemove={vi.fn()}
      />,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Show definition of Hello' }))
    expect(await screen.findByText('A greeting.')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Show definition of World' }))

    expect(await screen.findByText('The earth.')).toBeInTheDocument()
    await expect
      .poll(() => screen.queryByText('A greeting.'), { timeout: 1000 })
      .not.toBeInTheDocument()
  })
})
