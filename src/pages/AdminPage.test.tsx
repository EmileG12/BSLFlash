import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { supabase } from '../lib/supabase'
import { deleteSignVideoFile, uploadSignVideoFile, type UploadedSignVideoFile } from '../lib/signVideoUpload'
import { renderWithQueryClient } from '../test/renderWithQueryClient'
import { AdminPage } from './AdminPage'

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
    rpc: vi.fn(),
  },
}))

vi.mock('../lib/signVideoUpload', () => ({
  uploadSignVideoFile: vi.fn(),
  deleteSignVideoFile: vi.fn(),
}))

const UPLOADED: UploadedSignVideoFile = {
  storagePath: 'sign-1/clip.mp4',
  format: 'mp4',
  metadata: { durationMs: 1800, width: 320, height: 240 },
}

function mockListEndpoints(wordsData: unknown[] = []) {
  vi.mocked(supabase.from).mockImplementation(
    ((table: string) =>
      table === 'categories'
        ? { select: vi.fn().mockReturnValue({ order: vi.fn().mockResolvedValue({ data: [], error: null }) }) }
        // Spreads into a fresh array each call, as a real fetch would -- resolving
        // the SAME array reference every time would let React bail out of
        // re-rendering since nothing "changed" by reference, masking a refetch.
        : { select: vi.fn().mockReturnValue({ order: vi.fn().mockResolvedValue({ data: [...wordsData], error: null }) }) }) as never,
  )
}

async function fillAndSubmit(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByPlaceholderText('Word'), 'Hello')
  await user.type(screen.getByPlaceholderText('Definition'), 'A greeting.')
  await user.upload(screen.getByLabelText('Video file'), new File(['x'], 'clip.mp4', { type: 'video/mp4' }))
  await user.click(screen.getByRole('button', { name: /add word/i }))
}

describe('AdminPage - AddWordForm', () => {
  it('shows a distinct message and makes no RPC call when the video upload itself fails', async () => {
    mockListEndpoints()
    vi.mocked(uploadSignVideoFile).mockRejectedValue(new Error('Bucket not found'))
    const user = userEvent.setup()

    renderWithQueryClient(<AdminPage />)
    await fillAndSubmit(user)

    expect(await screen.findByRole('alert')).toHaveTextContent('Video upload failed: Bucket not found. No changes were saved.')
    expect(supabase.rpc).not.toHaveBeenCalled()
  })

  it('reports a clean rollback when the RPC fails but the compensating delete succeeds', async () => {
    mockListEndpoints()
    vi.mocked(uploadSignVideoFile).mockResolvedValue(UPLOADED)
    vi.mocked(supabase.rpc).mockResolvedValue({ data: null, error: { message: 'duplicate word' } } as never)
    vi.mocked(deleteSignVideoFile).mockResolvedValue(undefined)
    const user = userEvent.setup()

    renderWithQueryClient(<AdminPage />)
    await fillAndSubmit(user)

    expect(await screen.findByRole('alert')).toHaveTextContent('Failed to add word: duplicate word. No changes were saved.')
    expect(deleteSignVideoFile).toHaveBeenCalledWith('sign-1/clip.mp4')
  })

  it('flags an orphaned file when the RPC fails and the compensating delete also fails', async () => {
    mockListEndpoints()
    vi.mocked(uploadSignVideoFile).mockResolvedValue(UPLOADED)
    vi.mocked(supabase.rpc).mockResolvedValue({ data: null, error: { message: 'duplicate word' } } as never)
    vi.mocked(deleteSignVideoFile).mockRejectedValue(new Error('network error'))
    const user = userEvent.setup()

    renderWithQueryClient(<AdminPage />)
    await fillAndSubmit(user)

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Failed to add word: duplicate word. No changes were saved, but the uploaded video file could not be removed and may need manual cleanup (path: sign-1/clip.mp4).',
    )
  })

  it('uploads first, calls the atomic RPC with the generated sign id, and shows success', async () => {
    mockListEndpoints()
    vi.mocked(uploadSignVideoFile).mockResolvedValue(UPLOADED)
    vi.mocked(supabase.rpc).mockResolvedValue({ data: [{ word_id: 'w1', sign_id: 's1', sign_video_id: 'v1' }], error: null } as never)
    const user = userEvent.setup()

    renderWithQueryClient(<AdminPage />)
    await fillAndSubmit(user)

    expect(await screen.findByRole('status')).toHaveTextContent('Added "Hello".')
    expect(supabase.rpc).toHaveBeenCalledWith(
      'add_word_with_video',
      expect.objectContaining({
        p_word: 'Hello',
        p_definition: 'A greeting.',
        p_storage_path: 'sign-1/clip.mp4',
        p_format: 'mp4',
        p_duration_ms: 1800,
        p_width: 320,
        p_height: 240,
      }),
    )
  })

  it('refetches the words list after a successful add, so the new word appears without a manual refresh', async () => {
    const wordsData: { id: string; word: string; definition: string }[] = []
    mockListEndpoints(wordsData)
    vi.mocked(uploadSignVideoFile).mockResolvedValue(UPLOADED)
    vi.mocked(supabase.rpc).mockResolvedValue({ data: [{ word_id: 'w1', sign_id: 's1', sign_video_id: 'v1' }], error: null } as never)
    const user = userEvent.setup()

    renderWithQueryClient(<AdminPage />)
    expect(await screen.findByText('No words match.')).toBeInTheDocument()

    // Simulate the RPC having created the row server-side: the next fetch of
    // 'words' (triggered by invalidateQueries after the RPC resolves) sees it.
    wordsData.push({ id: 'w1', word: 'Hello', definition: 'A greeting.' })
    await fillAndSubmit(user)

    expect(await screen.findByRole('cell', { name: 'Hello' })).toBeInTheDocument()
  })
})

describe('AdminPage - EditWordCategoriesRow', () => {
  const CATEGORIES = [
    { id: 'c1', category_name: 'Animals' },
    { id: 'c2', category_name: 'Colors' },
  ]
  const WORDS = [{ id: 'w1', word: 'Hello', definition: 'A greeting.' }]

  function mockTables({
    initialSelectedIds = [] as string[],
    rpcError = null as { message: string } | null,
  } = {}) {
    vi.mocked(supabase.from).mockImplementation(
      ((table: string) => {
        if (table === 'categories') {
          return { select: vi.fn().mockReturnValue({ order: vi.fn().mockResolvedValue({ data: CATEGORIES, error: null }) }) }
        }
        if (table === 'word_categories') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({
                data: initialSelectedIds.map((category_id) => ({ category_id })),
                error: null,
              }),
            }),
          }
        }
        return { select: vi.fn().mockReturnValue({ order: vi.fn().mockResolvedValue({ data: [...WORDS], error: null }) }) }
      }) as never,
    )
    vi.mocked(supabase.rpc).mockResolvedValue({ data: null, error: rpcError } as never)
  }

  async function expandRow(user: ReturnType<typeof userEvent.setup>) {
    renderWithQueryClient(<AdminPage />)
    const table = await screen.findByRole('table')
    const row = (await within(table).findByRole('cell', { name: 'Hello' })).closest('tr')!
    await user.click(within(row).getByRole('button', { name: 'Edit categories' }))
    await within(table).findByRole('group', { name: 'Tags' })
    return within(table)
  }

  it('toggling a tag updates the UI but makes no RPC call until Save edit is clicked', async () => {
    mockTables({ initialSelectedIds: ['c1'] })
    const user = userEvent.setup()

    const table = await expandRow(user)
    await user.click(table.getByRole('button', { name: 'Colors' }))

    expect(table.getByRole('button', { name: 'Colors' })).toHaveAttribute('aria-pressed', 'true')
    expect(supabase.rpc).not.toHaveBeenCalled()
  })

  it('revert changes restores the saved selection without calling the database', async () => {
    mockTables({ initialSelectedIds: ['c1'] })
    const user = userEvent.setup()

    const table = await expandRow(user)
    await user.click(table.getByRole('button', { name: 'Colors' }))
    await user.click(table.getByRole('button', { name: 'Animals' }))
    await user.click(table.getByRole('button', { name: 'Revert changes' }))

    expect(table.getByRole('button', { name: 'Animals' })).toHaveAttribute('aria-pressed', 'true')
    expect(table.getByRole('button', { name: 'Colors' })).toHaveAttribute('aria-pressed', 'false')
    expect(supabase.rpc).not.toHaveBeenCalled()
    expect(table.getByRole('button', { name: 'Save edit' })).toBeDisabled()
    expect(table.getByRole('button', { name: 'Revert changes' })).toBeDisabled()
  })

  it('save edit sends the whole draft to set_word_categories in one atomic call, then matches the saved state', async () => {
    mockTables({ initialSelectedIds: ['c1'] })
    const user = userEvent.setup()

    const table = await expandRow(user)
    await user.click(table.getByRole('button', { name: 'Animals' }))
    await user.click(table.getByRole('button', { name: 'Colors' }))
    await user.click(table.getByRole('button', { name: 'Save edit' }))

    expect(await table.findByRole('button', { name: 'Save edit' })).toBeDisabled()
    expect(supabase.rpc).toHaveBeenCalledTimes(1)
    expect(supabase.rpc).toHaveBeenCalledWith('set_word_categories', { p_word_id: 'w1', p_category_ids: ['c2'] })
    expect(table.getByRole('button', { name: 'Animals' })).toHaveAttribute('aria-pressed', 'false')
    expect(table.getByRole('button', { name: 'Colors' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('shows an error and keeps the draft when saving fails', async () => {
    mockTables({ initialSelectedIds: ['c1'], rpcError: { message: 'write denied' } })
    const user = userEvent.setup()

    const table = await expandRow(user)
    await user.click(table.getByRole('button', { name: 'Colors' }))
    await user.click(table.getByRole('button', { name: 'Save edit' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('write denied')
    expect(table.getByRole('button', { name: 'Colors' })).toHaveAttribute('aria-pressed', 'true')
    expect(table.getByRole('button', { name: 'Animals' })).toHaveAttribute('aria-pressed', 'true')
    expect(table.getByRole('button', { name: 'Save edit' })).not.toBeDisabled()
  })
})
