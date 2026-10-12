# database.types

**Path:** `src/lib/database.types.ts`

**Purpose:** Generated TypeScript types for the live Supabase schema — table rows, RPC function signatures, etc. Not hand-written: regenerated after every migration via `npx supabase gen types typescript --local > src/lib/database.types.ts` (see the `migrations` skill). Don't hand-edit it; a stale copy just hides real schema-mismatch errors instead of catching them at compile time.

A changed RPC parameter list (e.g. adding an optional argument) regenerates as an updated `Args` type for that function here — this is what makes a hook passing a stale argument shape (missing a new required param, or misspelling an optional one) a compile error rather than a silent runtime mismatch.

See [supabase-client](./supabase-client.md) for how this type is wired into the app (`createClient<Database>(...)`).

Regenerated after the `custom_categories` -> `custom_decks` rename and the public-deck-directory migrations, so it now reflects `custom_decks`/`custom_deck_words`/`custom_deck_tags`/`saved_decks`/`deck_likes` and the new RPCs (`create_custom_deck`, `update_custom_deck`, `set_custom_deck_public`, `get_categories_with_words`, `get_public_decks`, `get_available_deck_tags`, `get_saved_decks`) in place of the old `custom_categories`/`custom_category_words`/`create_custom_category`.

Regenerated again after the admin-roles migrations: `categories.is_active`, `signs.is_primary` (added), `sign_videos.is_primary` (removed), and the new RPCs (`is_admin`, `list_users_with_roles`, `assign_role`, `revoke_role`, `ban_user`, `unban_user`, `set_primary_sign`) plus the rewritten `get_random_word_for_category`/`get_random_words_for_category`/`get_categories_with_words`/`get_available_subcategories_for_category`.

Regenerated again after renaming the `custom_decks`/`custom_deck_words` PK/FK constraints to match their tables (they'd kept the old `custom_categories_`/`custom_category_words_` names since Postgres doesn't rename constraints on `RENAME TABLE`) — the only change is the `foreignKeyName` strings on `custom_deck_words`' relationships.
