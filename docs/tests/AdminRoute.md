# AdminRoute.test.tsx

**Path:** `src/components/AdminRoute.test.tsx`
**Tests:** [AdminRoute](../components/AdminRoute.md)
**Suite:** `unit` (jsdom) — runs on `npm run test`

## Coverage

- Renders neither the guarded page nor the home page while roles are loading.
- Redirects to `/` when the user holds neither role.
- Renders the guarded `/admin` route for an admin.
- Renders the guarded route for a superadmin too.

## Notes

Mocks `../hooks/useUserRoles` directly, so no Supabase mocking is needed; each test sets `isAdmin`, `isSuperadmin`, and `loading` via `mockReturnValue`. Rendered inside a `MemoryRouter` with the guard as a layout route, and asserts on which page's text appears.

The superadmin case passes the admin gate because the guard checks `isAdmin || isSuperadmin`; `is_admin()` does not imply superadmin, which is why the superadmin case is tested separately from the admin case. See [useUserRoles](../hooks/useUserRoles.md).
