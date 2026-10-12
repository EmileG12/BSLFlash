import { act, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { supabase } from '../lib/supabase'
import { renderHookWithQueryClient } from '../test/renderHookWithQueryClient'
import { useWordVariants } from './useWordVariants'

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}))

const VIDEO = {
  id: 'video-1',
  storage_path: 'hello/standard.mp4',
  format: 'mp4',
  duration_ms: 1000,
  width: 640,
  height: 480,
  file_size: 1024,
}

function mockVariants(result: { data?: unknown; error?: unknown }) {
  vi.mocked(supabase.from).mockReturnValue({
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({ order: vi.fn().mockResolvedValue(result) }),
    }),
  } as never)
}

describe('useWordVariants', () => {
  it('starts in a loading state', () => {
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({ order: vi.fn().mockReturnValue(new Promise(() => {})) }),
      }),
    } as never)

    const { result } = renderHookWithQueryClient(() => useWordVariants('word-1'))

    expect(result.current.loading).toBe(true)
    expect(result.current.variants).toEqual([])
  })

  it("returns a word's sign variants with their video pools", async () => {
    mockVariants({
      data: [{ id: 'sign-1', variant_name: 'Standard', region: null, is_primary: true, sign_videos: [VIDEO] }],
      error: null,
    })

    const { result } = renderHookWithQueryClient(() => useWordVariants('word-1'))

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.variants).toEqual([
      { id: 'sign-1', variant_name: 'Standard', region: null, is_primary: true, sign_videos: [VIDEO] },
    ])
  })

  it('sets an error message when the fetch fails', async () => {
    mockVariants({ data: null, error: { message: 'network error' } })

    const { result } = renderHookWithQueryClient(() => useWordVariants('word-1'))

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBe('network error')
  })

  it('setVariants lets the caller apply a local update, e.g. after set_primary_sign', async () => {
    mockVariants({
      data: [
        { id: 'sign-1', variant_name: 'Standard', region: null, is_primary: true, sign_videos: [] },
        { id: 'sign-2', variant_name: 'Regional', region: 'North', is_primary: false, sign_videos: [] },
      ],
      error: null,
    })

    const { result } = renderHookWithQueryClient(() => useWordVariants('word-1'))
    await waitFor(() => expect(result.current.loading).toBe(false))

    act(() => {
      result.current.setVariants((previous) =>
        previous.map((variant) => ({ ...variant, is_primary: variant.id === 'sign-2' })),
      )
    })

    await waitFor(() => expect(result.current.variants.find((v) => v.id === 'sign-2')?.is_primary).toBe(true))
    expect(result.current.variants.find((v) => v.id === 'sign-1')?.is_primary).toBe(false)
  })
})
