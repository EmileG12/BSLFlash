import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { TagChipList } from './TagChipList'

const TAGS = [
  { id: 'tag-1', category_name: 'GCSE' },
  { id: 'tag-2', category_name: 'Animals' },
]

describe('TagChipList', () => {
  it('renders nothing when empty and no emptyMessage is given', () => {
    const { container } = render(
      <TagChipList
        heading="Tags"
        headingId="h"
        tags={[]}
        loading={false}
        error={null}
        selectedIds={[]}
        onToggle={vi.fn()}
      />,
    )

    expect(container).toBeEmptyDOMElement()
  })

  it('shows the emptyMessage when given and there are no tags', () => {
    render(
      <TagChipList
        heading="Tags"
        headingId="h"
        tags={[]}
        loading={false}
        error={null}
        selectedIds={[]}
        onToggle={vi.fn()}
        emptyMessage="No tags available yet."
      />,
    )

    expect(screen.getByText('No tags available yet.')).toBeInTheDocument()
  })

  it('marks selected tags as pressed and calls onToggle with the tag id', async () => {
    const onToggle = vi.fn()
    const user = userEvent.setup()

    render(
      <TagChipList
        heading="Tags"
        headingId="h"
        tags={TAGS}
        loading={false}
        error={null}
        selectedIds={['tag-1']}
        onToggle={onToggle}
      />,
    )

    expect(screen.getByRole('button', { name: 'GCSE' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Animals' })).toHaveAttribute('aria-pressed', 'false')

    await user.click(screen.getByRole('button', { name: 'Animals' }))
    expect(onToggle).toHaveBeenCalledWith('tag-2')
  })

  it('shows a loading skeleton', () => {
    render(
      <TagChipList
        heading="Tags"
        headingId="h"
        tags={[]}
        loading={true}
        error={null}
        selectedIds={[]}
        onToggle={vi.fn()}
      />,
    )

    expect(screen.getByText(/loading tags/i)).toBeInTheDocument()
  })
})
