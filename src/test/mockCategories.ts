import { vi } from 'vitest'
import { supabase } from '../lib/supabase'

/**
 * Stubs the Supabase query chain that `useCategories` builds:
 * `.from('categories').select(...).eq('is_vocabulary', ...).order(...)`.
 *
 * Each link returns the next one, and only `.order()` resolves, because that's
 * the call `useCategories` awaits. Returns the `eq` spy so a test can assert
 * which `is_vocabulary` value was filtered on.
 *
 * Requires the calling test file to declare `vi.mock('../lib/supabase', ...)`
 * itself — module mocks are hoisted per file and can't be registered from here.
 */
export function mockCategories(result: { data?: unknown; error?: unknown }) {
  const order = vi.fn().mockResolvedValue(result)
  const eq = vi.fn().mockReturnValue({ order })
  vi.mocked(supabase.from).mockReturnValue({
    select: vi.fn().mockReturnValue({ eq }),
  } as never)
  return { eq }
}

/** Same chain, but the query never settles — for asserting loading states. */
export function mockCategoriesPending() {
  const order = vi.fn().mockReturnValue(new Promise(() => {}))
  const eq = vi.fn().mockReturnValue({ order })
  vi.mocked(supabase.from).mockReturnValue({
    select: vi.fn().mockReturnValue({ eq }),
  } as never)
  return { eq }
}
