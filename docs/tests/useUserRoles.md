# useUserRoles.test.ts

**Path:** `src/hooks/useUserRoles.test.ts`
**Tests:** [useUserRoles](../hooks/useUserRoles.md)
**Suite:** `unit` (jsdom) — runs on `npm run test`

## Coverage

- Stays `loading: true` (with both roles `false`) while auth itself is still loading.
- With no session, resolves to `loading: false` with both roles `false`, and calls neither `is_admin` nor `is_superadmin`.
- With a session, resolves `isAdmin` from `is_admin` independently of `isSuperadmin` from `is_superadmin` (admin true, superadmin false).
- With a session, resolves the reverse case (admin false, superadmin true), so a superadmin is not reported as admin unless `is_admin` says so.

## Notes

Mocks `./useAuth` directly with a `vi.mock` factory, so the session and loading state are set per test with `mockReturnValue` rather than through a real auth provider. Mocks `../lib/supabase` with a bare `rpc: vi.fn()`; a `mockRoles` helper sets a `mockImplementation` keyed on the RPC name, because the two calls need different return values within the same test. Any other RPC name throws, so an unexpected call fails loudly.

The no-session test asserts `supabase.rpc` was never called, which pins the no-session short-circuit described in [useUserRoles](../hooks/useUserRoles.md).
