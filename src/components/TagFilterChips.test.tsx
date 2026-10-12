import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { supabase } from '../lib/supabase'
import { TagFilterChips } from './TagFilterChips'

vi.mock('../lib/supabase', () => ({
  supabase: {
    rpc: vi.fn(),
  },
}))

function mockTags(data: { id: string; category_name: string }[]) {
  vi.mocked(supabase.rpc).mockResolvedValue({ data, error: null } as never)
}

describe('TagFilterChips', () => {
  it('renders nothing when there are no tags in use', async () => {
    mockTags([])

    const { container } = render(<TagFilterChips selectedIds={[]} onToggle={vi.fn()} />)

    await waitFor(() => expect(container).toBeEmptyDOMElement())
  })

  it('marks selected tags as pressed and calls onToggle with the tag id', async () => {
    mockTags([
      { id: 'tag-1', category_name: 'GCSE' },
      { id: 'tag-2', category_name: 'Animals' },
    ])
    const onToggle = vi.fn()
    const user = userEvent.setup()

    render(<TagFilterChips selectedIds={['tag-1']} onToggle={onToggle} />)

    const gcse = await screen.findByRole('button', { name: 'GCSE' })
    expect(gcse).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Animals' })).toHaveAttribute('aria-pressed', 'false')

    await user.click(screen.getByRole('button', { name: 'Animals' }))
    expect(onToggle).toHaveBeenCalledWith('tag-2')
  })

  it('shows a directory-specific fallback message on a fetch error', async () => {
    vi.mocked(supabase.rpc).mockResolvedValue({ data: null, error: { message: 'boom' } } as never)

    render(<TagFilterChips selectedIds={[]} onToggle={vi.fn()} />)

    expect(await screen.findByText('Tags unavailable — showing all decks')).toBeInTheDocument()
  })
})
