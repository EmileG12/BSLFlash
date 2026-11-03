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
 * WordPicker's lists are packed tightly enough that an open definition
 * popover can visually cover the row directly below it, including that
 * row's own "show definition" trigger -- and, just as often, its much
 * bigger add/remove button. Both cases need real layout and hit-testing
 * (jsdom has no layout engine, so `document.elementFromPoint` can't resolve
 * anything meaningfully), which is why these two cases live here rather than
 * in WordPicker.test.tsx.
 *
 * Switching from one open definition popover straight to another relies on
 * Radix's pointerdown-outside dismissal racing against the next trigger's own
 * click in real event order. In jsdom, userEvent's synthetic click lets the
 * dismissal consume the event that would have opened the new popover, so the
 * first click only closes the old one and a second click is needed -- that
 * doesn't happen with real pointer events in a browser.
 *
 * The real-app behavior this guards against only happens because the
 * definition popover's real on-screen position (from src/index.css, normally
 * pulled in once by main.tsx) is what causes the overlap at all. Rendering
 * WordPicker in isolation here skips that import chain, so it's imported
 * directly below.
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

    // Hello's own open popover visually covers World's trigger at this exact
    // point, so Playwright's default actionability check refuses the click as
    // "intercepted" -- force: true skips that refusal while still dispatching
    // a real click at World's trigger coordinates, letting the browser's own
    // hit-test route it to whatever's actually on top (Hello's popover),
    // exactly like a real click there would.
    await userEvent.click(screen.getByRole('button', { name: 'Show definition of World' }), {
      force: true,
    })

    expect(await screen.findByText('The earth.')).toBeInTheDocument()
    await expect
      .poll(() => screen.queryByText('A greeting.'), { timeout: 1000 })
      .not.toBeInTheDocument()
  })

  it('does not add a word whose add button is covered by a different open popover', async () => {
    const onAdd = vi.fn()
    render(
      <WordPicker
        words={WORDS}
        loading={false}
        error={null}
        selectedIds={[]}
        onAdd={onAdd}
        onRemove={vi.fn()}
      />,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Show definition of Hello' }))
    expect(await screen.findByText('A greeting.')).toBeInTheDocument()

    // See the force: true note in the previous test -- World's add button is
    // genuinely covered by Hello's open popover at this point.
    await userEvent.click(screen.getByRole('button', { name: 'World' }), { force: true })

    expect(onAdd).not.toHaveBeenCalled()
    expect(screen.getByText('A greeting.')).toBeInTheDocument()
  })
})
