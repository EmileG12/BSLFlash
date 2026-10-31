import { afterEach, describe, expect, it, vi } from 'vitest'
import { supabase } from './supabase'
import { deleteSignVideoFile, uploadSignVideoFile } from './signVideoUpload'

vi.mock('./supabase', () => ({
  supabase: {
    storage: {
      from: vi.fn(),
    },
  },
}))

function mockUpload(result: { error: unknown }) {
  vi.mocked(supabase.storage.from).mockReturnValue({
    upload: vi.fn().mockResolvedValue(result),
  } as never)
}

function mockRemove(result: { data: unknown; error: unknown }) {
  vi.mocked(supabase.storage.from).mockReturnValue({
    remove: vi.fn().mockResolvedValue(result),
  } as never)
}

/**
 * jsdom doesn't implement real <video> playback, so readVideoMetadata's
 * onloadedmetadata/onerror handlers never fire on their own. Stubs
 * document.createElement('video') and window.URL.createObjectURL so setting
 * `.src` synchronously resolves with fake metadata (or fails), just enough
 * for uploadSignVideoFile's metadata-reading step to complete.
 */
function stubVideoMetadata(outcome: { duration: number; width: number; height: number } | 'error') {
  const realCreateElement = document.createElement.bind(document)
  vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
    if (tagName !== 'video') return realCreateElement(tagName)
    const el = {
      preload: '',
      onloadedmetadata: null as (() => void) | null,
      onerror: null as (() => void) | null,
      duration: 0,
      videoWidth: 0,
      videoHeight: 0,
      set src(_value: string) {
        if (outcome === 'error') {
          this.onerror?.()
        } else {
          this.duration = outcome.duration
          this.videoWidth = outcome.width
          this.videoHeight = outcome.height
          this.onloadedmetadata?.()
        }
      },
    }
    return el as unknown as HTMLVideoElement
  })
  vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:fake')
  vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
}

afterEach(() => {
  vi.restoreAllMocks()
})

function mp4File() {
  return new File(['x'], 'clip.mp4', { type: 'video/mp4' })
}

describe('uploadSignVideoFile', () => {
  it('rejects a file whose type is not mp4 or webm before touching Storage', async () => {
    const file = new File(['x'], 'clip.mov', { type: 'video/quicktime' })

    await expect(uploadSignVideoFile('sign-1', file)).rejects.toThrow('Video must be an mp4 or webm file.')
    expect(supabase.storage.from).not.toHaveBeenCalled()
  })

  it('throws when the video file cannot be read', async () => {
    stubVideoMetadata('error')

    await expect(uploadSignVideoFile('sign-1', mp4File())).rejects.toThrow('Could not read the video file.')
    expect(supabase.storage.from).not.toHaveBeenCalled()
  })

  it('throws the Storage error and does not return a path when the upload fails', async () => {
    stubVideoMetadata({ duration: 1.8, width: 320, height: 240 })
    mockUpload({ error: { message: 'Bucket not found' } })

    await expect(uploadSignVideoFile('sign-1', mp4File())).rejects.toMatchObject({ message: 'Bucket not found' })
  })

  it('uploads under the given sign id and reports the read metadata on success', async () => {
    stubVideoMetadata({ duration: 1.8, width: 320, height: 240 })
    mockUpload({ error: null })

    const result = await uploadSignVideoFile('sign-1', mp4File())

    expect(result.format).toBe('mp4')
    expect(result.storagePath.startsWith('sign-1/')).toBe(true)
    expect(result.storagePath.endsWith('.mp4')).toBe(true)
    expect(result.metadata).toEqual({ durationMs: 1800, width: 320, height: 240 })
  })
})

describe('deleteSignVideoFile', () => {
  it('resolves when the remove call actually removed the object', async () => {
    mockRemove({ data: [{ name: 'sign-1/clip.mp4' }], error: null })

    await expect(deleteSignVideoFile('sign-1/clip.mp4')).resolves.toBeUndefined()
  })

  it('throws when the remove call fails, so a caller can tell cleanup apart from a clean rollback', async () => {
    mockRemove({ data: null, error: { message: 'network error' } })

    await expect(deleteSignVideoFile('sign-1/clip.mp4')).rejects.toMatchObject({ message: 'network error' })
  })

  it('throws when the API reports no error but removed nothing, e.g. RLS silently filtered the object out', async () => {
    mockRemove({ data: [], error: null })

    await expect(deleteSignVideoFile('sign-1/clip.mp4')).rejects.toThrow(
      'The video file was not removed (no object was deleted).',
    )
  })
})
