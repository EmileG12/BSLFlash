import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { WordPicker } from './WordPicker'

const WORDS = [
  { id: 'word-1', word: 'Hello', definition: 'A greeting.' },
  { id: 'word-2', word: 'World', definition: 'The earth.' },
]

function renderPicker(selectedIds: string[] = []) {
  const onAdd = vi.fn()
  const onRemove = vi.fn()
  render(
    <WordPicker
      words={WORDS}
      loading={false}
      error={null}
      selectedIds={selectedIds}
      onAdd={onAdd}
      onRemove={onRemove}
    />,
  )
  return { onAdd, onRemove }
}

describe('WordPicker', () => {
  it('adds a word when its catalog row is clicked, without opening the definition popover', async () => {
    const { onAdd } = renderPicker()
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: 'Hello' }))

    expect(onAdd).toHaveBeenCalledWith('word-1')
    expect(screen.queryByText('A greeting.')).not.toBeInTheDocument()
  })

  it('shows a word definition without adding it when its catalog info icon is clicked', async () => {
    const { onAdd } = renderPicker()
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: 'Show definition of Hello' }))

    expect(await screen.findByText('A greeting.')).toBeInTheDocument()
    expect(onAdd).not.toHaveBeenCalled()
  })

  it('shows a selected word definition without removing it when its cart info icon is clicked', async () => {
    const { onRemove } = renderPicker(['word-1'])
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: 'Show definition of Hello' }))

    expect(await screen.findByText('A greeting.')).toBeInTheDocument()
    expect(onRemove).not.toHaveBeenCalled()
  })

  it('closes an open popover when clicking anywhere else', async () => {
    renderPicker()
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: 'Show definition of Hello' }))
    expect(await screen.findByText('A greeting.')).toBeInTheDocument()

    await user.click(screen.getByPlaceholderText('Search words...'))

    expect(screen.queryByText('A greeting.')).not.toBeInTheDocument()
  })
})
