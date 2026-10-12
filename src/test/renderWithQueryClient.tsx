import type { ReactElement } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, type RenderOptions } from '@testing-library/react'

/**
 * Renders a component that (transitively) uses `useQuery`/`useMutation`
 * inside a fresh `QueryClientProvider`. Retries are disabled so a test that
 * triggers an error fails immediately instead of retrying first.
 */
export function renderWithQueryClient(ui: ReactElement, options?: RenderOptions) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>, options)
}
