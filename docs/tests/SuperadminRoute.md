# SuperadminRoute.test.tsx

**Path:** `src/components/SuperadminRoute.test.tsx`
**Tests:** [SuperadminRoute](../components/SuperadminRoute.md)
**Suite:** `unit` (jsdom) — runs on `npm run test`

## Coverage

- Renders neither the guarded page nor the home page while roles are loading.
- Redirects an admin-only user (not superadmin) to `/`.
- Renders the guarded `/superadmin/roles` route for a superadmin.

## Notes

Same approach as [AdminRoute.test.tsx](./AdminRoute.md): mocks `../hooks/useUserRoles` directly and sets roles per test with `mockReturnValue`, rendering the guard as a layout route inside a `MemoryRouter` and asserting on which page's text appears. See [useUserRoles](../hooks/useUserRoles.md).
