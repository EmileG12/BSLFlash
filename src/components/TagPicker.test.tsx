import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { supabase } from '../lib/supabase'
import { renderWithQueryClient } from '../test/renderWithQueryClient'
import { TagPicker } from './TagPicker'

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}))

function mockCategories(data: { id: string; category_name: string }[]) {
  vi.mocked(supabase.from).mockReturnValue({
    select: vi.fn().mockReturnValue({ order: vi.fn().mockResolvedValue({ data, error: null }) }),
  } as never)
}

describe('TagPicker', () => {
  it('shows the empty message when there are no categories at all', async () => {
    mockCategories([])

    renderWithQueryClient(<TagPicker selectedIds={[]} onToggle={vi.fn()} />)

    expect(await screen.findByText('No tags available yet.')).toBeInTheDocument()
  })

  it('offers every category, not just ones already in use as tags', async () => {
    mockCategories([
      { id: 'tag-1', category_name: 'GCSE' },
      { id: 'tag-2', category_name: 'Animals' },
    ])
    const onToggle = vi.fn()
    const user = userEvent.setup()

    renderWithQueryClient(<TagPicker selectedIds={['tag-1']} onToggle={onToggle} />)

    expect(await screen.findByRole('button', { name: 'GCSE' })).toHaveAttribute('aria-pressed', 'true')
    await user.click(screen.getByRole('button', { name: 'Animals' }))
    expect(onToggle).toHaveBeenCalledWith('tag-2')
  })
})
