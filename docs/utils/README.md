# Utilities

Non-hook, non-component modules, one doc file per module.

| Module | Path | Purpose |
|---|---|---|
| [supabase-client](./supabase-client.md) | `src/lib/supabase.ts` | Singleton Supabase client used to talk to Postgres/Auth/Storage. |
| [auth](./auth.md) | `src/lib/auth.ts` | Wraps Supabase Auth sign-in/sign-out calls; sign-out also clears the React Query cache. |
| [queryClient](./queryClient.md) | `src/lib/queryClient.ts` | The single `QueryClient` instance backing React Query across the app. |
| [database.types](./database.types.md) | `src/lib/database.types.ts` | Generated TypeScript types for the live Supabase schema. |
| [chipStyles](./chipStyles.md) | `src/lib/chipStyles.ts` | Shared Tailwind class strings for the pill-style toggle chips. |
| [signVideoUpload](./signVideoUpload.md) | `src/lib/signVideoUpload.ts` | Uploads a sign video file to the `sign-videos` bucket (reading its duration and dimensions in the browser) and removes an uploaded file again if the follow-up database write fails. Writes no database rows itself. |
| [userStatus](./userStatus.md) | `src/lib/userStatus.ts` | `isBanned()`: whether an account is currently banned, including the indefinite `'infinity'` sentinel. |
| [adminNav](./adminNav.md) | `src/lib/adminNav.ts` | Shared list of the five superadmin destinations, grouped for the desktop dropdown and flattened for the mobile list. |
| [utils](./utils.md) | `src/lib/utils.ts` | Re-exports the `cn` class-name merge helper, imported by the UI kit and by several components. |
