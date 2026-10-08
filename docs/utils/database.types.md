# database.types

**Path:** `src/lib/database.types.ts`

**Purpose:** Generated TypeScript types for the live Supabase schema — table rows, RPC function signatures, etc. Not hand-written: regenerated after every migration via `npx supabase gen types typescript --local > src/lib/database.types.ts` (see the `migrations` skill). Don't hand-edit it; a stale copy just hides real schema-mismatch errors instead of catching them at compile time.

See [supabase-client](./supabase-client.md) for how this type is wired into the app (`createClient<Database>(...)`).
