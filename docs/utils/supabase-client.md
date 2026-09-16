# supabase-client

**Path:** `src/lib/supabase.ts`

**Purpose:** Singleton Supabase client used by the rest of the app to talk to Postgres/Auth/Storage. Reads `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from the environment (typed in `src/vite-env.d.ts`) and throws at import time if either is missing.

**Exports:**

| Export | Type | Description |
|---|---|---|
| `supabase` | `SupabaseClient` | Shared client instance — import this rather than constructing a new client elsewhere. |

**Used by:** *(none yet — no components/hooks call this client today)*
