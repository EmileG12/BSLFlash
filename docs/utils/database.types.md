# database.types

**Path:** `src/lib/database.types.ts`

**Purpose:** Generated TypeScript types for the live Supabase schema — table rows, RPC function signatures, etc. Not hand-written: regenerated after every migration via `npx supabase gen types typescript --local > src/lib/database.types.ts` (see the `migrations` skill). Don't hand-edit it; a stale copy just hides real schema-mismatch errors instead of catching them at compile time.

A changed RPC parameter list (e.g. adding an optional argument) regenerates as an updated `Args` type for that function here — this is what makes a hook or page passing a stale argument shape (missing a new required param, or misspelling an optional one) a compile error rather than a silent runtime mismatch. For example, [`add_word_with_video`](../rpc-functions/add_word_with_video.md)'s `Args` type has `p_category_ids` as an optional `string[]` because its Postgres signature gives it a default.

See [supabase-client](./supabase-client.md) for how this type is wired into the app (`createClient<Database>(...)`).

Mirrors the full current live schema, including anonymously-callable RPCs: every table, column, and RLS-visible relationship under `docs/db-schema/`, and every RPC function's argument/return shape under `docs/rpc-functions/`. It has no independent content beyond the schema it's generated from — those index docs, not this file, are the source of truth for what currently exists.
