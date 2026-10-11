import { vi } from 'vitest'
import { supabase } from '../lib/supabase'

/**
 * Stubs the Supabase call `useCategories` makes:
 * `.rpc('get_categories_with_words', { p_is_vocabulary })`.
 *
 * Requires the calling test file to declare `vi.mock('../lib/supabase', ...)`
 * itself with `rpc: vi.fn()` — module mocks are hoisted per file and can't be
 * registered from here.
 */
export function mockCategories(result: { data?: unknown; error?: unknown }) {
  vi.mocked(supabase.rpc).mockResolvedValue(result as never)
}

/** Same call, but it never settles -- for asserting loading states. */
export function mockCategoriesPending() {
  vi.mocked(supabase.rpc).mockReturnValue(new Promise(() => {}) as never)
}
