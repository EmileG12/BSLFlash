# supabase-client

**Path:** `src/lib/supabase.ts`

**Purpose:** Singleton Supabase client used by the rest of the app to talk to Postgres/Auth/Storage. Reads `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from the environment (typed in `src/vite-env.d.ts`) and throws at import time if either is missing.

**Exports:**

| Export | Type | Description |
|---|---|---|
| `supabase` | `SupabaseClient<Database>` | Shared client instance — import this rather than constructing a new client elsewhere. |

**Typed against the live schema:** `createClient<Database>(...)` passes the generated `Database` type from `src/lib/database.types.ts`, so `.from()`/`.rpc()` calls are checked against the actual current tables/columns/RPC signatures — a typo'd table, column, or RPC name (or wrong parameter types) is a compile error here instead of a runtime failure. `database.types.ts` is generated, not hand-written (`npx supabase gen types typescript --local > src/lib/database.types.ts`) and must be regenerated after every migration — see the `migrations` skill, which folds this into the standard post-migration workflow. Since it's generated from the live database rather than committed source, don't hand-edit it.

**Used by:** [useAuth](../hooks/useAuth.md), [useCategories](../hooks/useCategories.md), [useRandomFlashcard](../hooks/useRandomFlashcard.md), [useWords](../hooks/useWords.md), [auth](./auth.md).
