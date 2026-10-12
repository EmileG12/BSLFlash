import type { PropsWithChildren } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react'

/**
 * Renders a hook that uses `useQuery`/`useMutation` inside a fresh
 * `QueryClientProvider`. Retries are disabled so a test that triggers an
 * error fails immediately instead of retrying first.
 */
export function renderHookWithQueryClient<Result, Props>(
  hook: (props: Props) => Result,
  options?: Parameters<typeof renderHook<Result, Props>>[1],
) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  function wrapper({ children }: PropsWithChildren) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }

  return renderHook(hook, { ...options, wrapper })
}
