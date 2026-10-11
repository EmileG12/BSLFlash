import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { DeckGrid } from './DeckGrid'

describe('DeckGrid', () => {
  it('shows a loading state', () => {
    render(
      <DeckGrid
        title="My Decks"
        items={[]}
        loading={true}
        error={null}
        emptyMessage="No decks yet."
        onSelect={() => {}}
      />,
    )

    expect(screen.getByText(/loading categories/i)).toBeInTheDocument()
  })

  it('shows an error message', () => {
    render(
      <DeckGrid
        title="My Decks"
        items={[]}
        loading={false}
        error="network error"
        emptyMessage="No decks yet."
        onSelect={() => {}}
      />,
    )

    expect(screen.getByText(/failed to load categories: network error/i)).toBeInTheDocument()
  })

  it('shows the empty message when there are no items', () => {
    render(
      <DeckGrid
        title="My Decks"
        items={[]}
        loading={false}
        error={null}
        emptyMessage="No decks yet."
        onSelect={() => {}}
      />,
    )

    expect(screen.getByText('No decks yet.')).toBeInTheDocument()
  })

  it('renders a button per item and calls onSelect with its id', async () => {
    const onSelect = vi.fn()
    const user = userEvent.setup()

    render(
      <DeckGrid
        title="My Decks"
        items={[
          { id: '1', name: 'Animals' },
          { id: '2', name: 'Greetings' },
        ]}
        loading={false}
        error={null}
        emptyMessage="No decks yet."
        onSelect={onSelect}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Animals' }))

    expect(onSelect).toHaveBeenCalledWith('1')
  })

  it('omits the delete button when onDelete is not given', () => {
    render(
      <DeckGrid
        title="My Decks"
        items={[{ id: '1', name: 'Animals' }]}
        loading={false}
        error={null}
        emptyMessage="No decks yet."
        onSelect={() => {}}
      />,
    )

    expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument()
  })

  it('renders a delete button per item and calls onDelete with the item when given', async () => {
    const onDelete = vi.fn()
    const user = userEvent.setup()

    render(
      <DeckGrid
        title="My Decks"
        items={[{ id: '1', name: 'Animals' }]}
        loading={false}
        error={null}
        emptyMessage="No decks yet."
        onSelect={() => {}}
        onDelete={onDelete}
      />,
    )

    await user.click(screen.getByRole('button', { name: /delete animals/i }))

    expect(onDelete).toHaveBeenCalledWith({ id: '1', name: 'Animals' })
  })

  it('renders an edit button per item and calls onEdit with the item when given', async () => {
    const onEdit = vi.fn()
    const user = userEvent.setup()

    render(
      <DeckGrid
        title="My Decks"
        items={[{ id: '1', name: 'Animals' }]}
        loading={false}
        error={null}
        emptyMessage="No decks yet."
        onSelect={() => {}}
        onEdit={onEdit}
      />,
    )

    await user.click(screen.getByRole('button', { name: /edit animals/i }))

    expect(onEdit).toHaveBeenCalledWith({ id: '1', name: 'Animals' })
  })

  it('omits the edit button when onEdit is not given', () => {
    render(
      <DeckGrid
        title="My Decks"
        items={[{ id: '1', name: 'Animals' }]}
        loading={false}
        error={null}
        emptyMessage="No decks yet."
        onSelect={() => {}}
      />,
    )

    expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument()
  })

  it('uses deleteActionLabel for the delete button aria-label when given', () => {
    render(
      <DeckGrid
        title="Saved Decks"
        items={[{ id: '1', name: 'Animals' }]}
        loading={false}
        error={null}
        emptyMessage="No decks yet."
        onSelect={() => {}}
        onDelete={() => {}}
        deleteActionLabel="Remove"
      />,
    )

    expect(screen.getByRole('button', { name: 'Remove Animals' })).toBeInTheDocument()
  })
})
