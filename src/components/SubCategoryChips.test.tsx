import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { supabase } from '../lib/supabase'
import { SubCategoryChips } from './SubCategoryChips'

vi.mock('../lib/supabase', () => ({
  supabase: {
    rpc: vi.fn(),
  },
}))

function mockRpc(result: { data?: unknown; error?: unknown }) {
  vi.mocked(supabase.rpc).mockReturnValue(Promise.resolve(result) as never)
}

describe('SubCategoryChips', () => {
  it('always shows "All", selected by default, even before the fetch resolves', () => {
    vi.mocked(supabase.rpc).mockReturnValue(new Promise(() => {}) as never)

    render(<SubCategoryChips categoryId="cat-1" selectedId={null} onSelect={vi.fn()} />)

    expect(screen.getByRole('button', { name: 'All' })).toHaveAttribute('aria-pressed', 'true')
    expect(supabase.rpc).toHaveBeenCalledWith('get_available_subcategories_for_category', {
      category_id: 'cat-1',
    })
  })

  it('renders a chip for each subcategory returned by the RPC', async () => {
    mockRpc({
      data: [
        { id: 'sub-1', category_name: 'Colours' },
        { id: 'sub-2', category_name: 'Time' },
      ],
      error: null,
    })

    render(<SubCategoryChips categoryId="cat-1" selectedId={null} onSelect={vi.fn()} />)

    expect(await screen.findByRole('button', { name: 'Colours' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Time' })).toBeInTheDocument()
  })

  it('marks the chip matching selectedId as pressed, not "All"', async () => {
    mockRpc({ data: [{ id: 'sub-1', category_name: 'Colours' }], error: null })

    render(<SubCategoryChips categoryId="cat-1" selectedId="sub-1" onSelect={vi.fn()} />)

    expect(await screen.findByRole('button', { name: 'Colours' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'All' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('calls onSelect with the subcategory id when a chip is clicked', async () => {
    mockRpc({ data: [{ id: 'sub-1', category_name: 'Colours' }], error: null })
    const onSelect = vi.fn()
    const user = userEvent.setup()

    render(<SubCategoryChips categoryId="cat-1" selectedId={null} onSelect={onSelect} />)

    await user.click(await screen.findByRole('button', { name: 'Colours' }))

    expect(onSelect).toHaveBeenCalledWith('sub-1')
  })

  it('calls onSelect with null when "All" is clicked', async () => {
    mockRpc({ data: [{ id: 'sub-1', category_name: 'Colours' }], error: null })
    const onSelect = vi.fn()
    const user = userEvent.setup()

    render(<SubCategoryChips categoryId="cat-1" selectedId="sub-1" onSelect={onSelect} />)

    await user.click(screen.getByRole('button', { name: 'All' }))

    expect(onSelect).toHaveBeenCalledWith(null)
  })

  it('shows only "All" plus a quiet note when the RPC fails', async () => {
    mockRpc({ data: null, error: { message: 'boom' } })

    render(<SubCategoryChips categoryId="cat-1" selectedId={null} onSelect={vi.fn()} />)

    expect(await screen.findByText(/topics unavailable/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Colours' })).not.toBeInTheDocument()
  })
})
