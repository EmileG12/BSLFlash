import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { supabase } from '../lib/supabase'
import { deleteSignVideoFile, uploadSignVideoFile, type UploadedSignVideoFile } from '../lib/signVideoUpload'
import { renderWithQueryClient } from '../test/renderWithQueryClient'
import { SuperadminWordEditPage } from './SuperadminWordEditPage'

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

const VARIANT = {
  id: 'sign-1',
  variant_name: 'Standard',
  region: null,
  is_primary: true,
  sign_videos: [
    { id: 'video-0', storage_path: 'sign-1/existing.mp4', format: 'mp4', duration_ms: 1000, width: 640, height: 480, file_size: 1024 },
  ],
}

const UPLOADED: UploadedSignVideoFile = {
  storagePath: 'sign-1/new-clip.mp4',
  format: 'mp4',
  metadata: { durationMs: 1500, width: 320, height: 240 },
}

function mockDataSources() {
  vi.mocked(supabase.from).mockImplementation(
    ((table: string) => {
      if (table === 'words') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: { word: 'Hello', definition: 'A greeting.' }, error: null }),
            }),
          }),
        }
      }
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({ order: vi.fn().mockResolvedValue({ data: [VARIANT], error: null }) }),
        }),
      }
    }) as never,
  )
}

function renderPage() {
  return renderWithQueryClient(
    <MemoryRouter initialEntries={['/superadmin/words/word-1']}>
      <Routes>
        <Route path="/superadmin/words/:wordId" element={<SuperadminWordEditPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('SuperadminWordEditPage - AddVideoDialog', () => {
  async function openAddVideoDialog(user: ReturnType<typeof userEvent.setup>) {
    renderPage()
    await user.click(await screen.findByRole('button', { name: /add video/i }))
    await user.upload(screen.getByLabelText('Video file'), new File(['x'], 'clip.mp4', { type: 'video/mp4' }))
  }

  it('shows a distinct message and makes no RPC call when the upload itself fails', async () => {
    mockDataSources()
    vi.mocked(uploadSignVideoFile).mockRejectedValue(new Error('Bucket not found'))
    const user = userEvent.setup()

    await openAddVideoDialog(user)
    await user.click(screen.getByRole('button', { name: 'Add video' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Video upload failed: Bucket not found. No changes were saved.')
    expect(supabase.rpc).not.toHaveBeenCalled()
  })

  it('flags an orphaned file when the RPC fails and the compensating delete also fails', async () => {
    mockDataSources()
    vi.mocked(uploadSignVideoFile).mockResolvedValue(UPLOADED)
    vi.mocked(supabase.rpc).mockReturnValue({
      single: vi.fn().mockResolvedValue({ data: null, error: { message: 'constraint violated' } }),
    } as never)
    vi.mocked(deleteSignVideoFile).mockRejectedValue(new Error('network error'))
    const user = userEvent.setup()

    await openAddVideoDialog(user)
    await user.click(screen.getByRole('button', { name: 'Add video' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Failed to add video: constraint violated. No changes were saved, but the uploaded video file could not be removed and may need manual cleanup (path: sign-1/new-clip.mp4).',
    )
  })

  it('uploads first, then calls add_video_to_sign with the sign id and upload result', async () => {
    mockDataSources()
    vi.mocked(uploadSignVideoFile).mockResolvedValue(UPLOADED)
    const single = vi.fn().mockResolvedValue({
      data: { id: 'video-1', storage_path: 'sign-1/new-clip.mp4', format: 'mp4', duration_ms: 1500, width: 320, height: 240, file_size: 1 },
      error: null,
    })
    vi.mocked(supabase.rpc).mockReturnValue({ single } as never)
    const user = userEvent.setup()

    await openAddVideoDialog(user)
    await user.click(screen.getByRole('button', { name: 'Add video' }))

    expect(supabase.rpc).toHaveBeenCalledWith(
      'add_video_to_sign',
      expect.objectContaining({ p_sign_id: 'sign-1', p_storage_path: 'sign-1/new-clip.mp4', p_format: 'mp4' }),
    )
    expect(await screen.findByText(/mp4 · 0:02 · 320×240/)).toBeInTheDocument()
  })
})

describe('SuperadminWordEditPage - AddVariantDialog', () => {
  async function openAddVariantDialog(user: ReturnType<typeof userEvent.setup>) {
    renderPage()
    await user.click(await screen.findByRole('button', { name: 'Add variant' }))
    await user.type(screen.getByPlaceholderText('Variant name'), 'One-handed')
    await user.upload(screen.getByLabelText('Video file'), new File(['x'], 'clip.mp4', { type: 'video/mp4' }))
  }

  it('shows a distinct message and makes no RPC call when the upload itself fails', async () => {
    mockDataSources()
    vi.mocked(uploadSignVideoFile).mockRejectedValue(new Error('Bucket not found'))
    const user = userEvent.setup()

    await openAddVariantDialog(user)
    await user.click(screen.getByRole('button', { name: 'Add variant' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Video upload failed: Bucket not found. No changes were saved.')
    expect(supabase.rpc).not.toHaveBeenCalled()
  })

  it('reports a clean rollback when the RPC fails but the compensating delete succeeds', async () => {
    mockDataSources()
    vi.mocked(uploadSignVideoFile).mockResolvedValue(UPLOADED)
    vi.mocked(supabase.rpc).mockReturnValue({
      single: vi.fn().mockResolvedValue({ data: null, error: { message: 'duplicate variant' } }),
    } as never)
    vi.mocked(deleteSignVideoFile).mockResolvedValue(undefined)
    const user = userEvent.setup()

    await openAddVariantDialog(user)
    await user.click(screen.getByRole('button', { name: 'Add variant' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Failed to add variant: duplicate variant. No changes were saved.')
    expect(deleteSignVideoFile).toHaveBeenCalledWith('sign-1/new-clip.mp4')
  })

  it('uploads first, generates a sign id, and calls add_variant_with_video', async () => {
    mockDataSources()
    vi.mocked(uploadSignVideoFile).mockResolvedValue(UPLOADED)
    const single = vi.fn().mockResolvedValue({
      data: {
        id: 'sign-2',
        variant_name: 'One-handed',
        region: null,
        is_primary: false,
        video_id: 'video-2',
        video_storage_path: 'sign-2/new-clip.mp4',
        video_format: 'mp4',
        video_duration_ms: 1500,
        video_width: 320,
        video_height: 240,
        video_file_size: 1,
      },
      error: null,
    })
    vi.mocked(supabase.rpc).mockReturnValue({ single } as never)
    const user = userEvent.setup()

    await openAddVariantDialog(user)
    await user.click(screen.getByRole('button', { name: 'Add variant' }))

    expect(supabase.rpc).toHaveBeenCalledWith(
      'add_variant_with_video',
      expect.objectContaining({ p_word_id: 'word-1', p_variant_name: 'One-handed', p_region: '' }),
    )
    expect(await screen.findByText('One-handed')).toBeInTheDocument()
  })
})
