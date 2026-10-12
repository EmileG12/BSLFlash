# auth.test.ts

**Path:** `src/lib/auth.test.ts`
**Tests:** [auth](../utils/auth.md)

## Coverage

- `signOut` clears the React Query cache (`queryClient.clear()`) after a successful sign-out.
- `signOut` does not clear the cache when the underlying Supabase sign-out call fails.

## Notes

Mocks both `./supabase` (`auth.signOut`) and `./queryClient` (`clear`) via explicit factories, so the test asserts the ordering/conditionality of the cache clear without touching a real `QueryClient` or Supabase client.
