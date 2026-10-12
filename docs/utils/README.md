# Utilities

Non-hook, non-component modules, one doc file per module.

| Module | Path | Purpose |
|---|---|---|
| [supabase-client](./supabase-client.md) | `src/lib/supabase.ts` | Singleton Supabase client used to talk to Postgres/Auth/Storage. |
| [auth](./auth.md) | `src/lib/auth.ts` | Wraps Supabase Auth sign-in/sign-out calls; sign-out also clears the React Query cache. |
| [queryClient](./queryClient.md) | `src/lib/queryClient.ts` | The single `QueryClient` instance backing React Query across the app. |
| [database.types](./database.types.md) | `src/lib/database.types.ts` | Generated TypeScript types for the live Supabase schema. |
| [chipStyles](./chipStyles.md) | `src/lib/chipStyles.ts` | Shared Tailwind class strings for the pill-style toggle chips. |
| [signVideoUpload](./signVideoUpload.md) | `src/lib/signVideoUpload.ts` | Uploads a sign video to the `sign-videos` bucket and inserts its `sign_videos` row, reading duration and dimensions in the browser. |
| [userStatus](./userStatus.md) | `src/lib/userStatus.ts` | `isBanned()`: whether an account is currently banned, including the indefinite `'infinity'` sentinel. |
| [adminNav](./adminNav.md) | `src/lib/adminNav.ts` | Shared list of the five superadmin destinations, grouped for the desktop dropdown and flattened for the mobile list. |
