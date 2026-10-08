# get_random_word_for_category

**Signature:** `public.get_random_word_for_category(category_id uuid, is_custom boolean DEFAULT false) RETURNS TABLE(word_id uuid, word text, definition text, storage_path text, format text)`
**Language:** SQL
**Last touched by migration:** [`20261008143806_extend_random_word_functions_for_custom_decks.sql`](../../supabase/migrations/20261008143806_extend_random_word_functions_for_custom_decks.sql)

**Purpose:** Powers the flashcard game — given a category or custom deck, returns one random word from it along with its primary sign video's storage path and format, for [FlashcardPage](../components/FlashcardPage.md) to render. `is_custom` selects which: `false` (the default) looks the id up in [`word_categories`](../db-schema/word_categories.md) (a `public.categories` row); `true` looks it up in [`custom_category_words`](../db-schema/custom_category_words.md) (a user-owned `custom_categories` row).

Only words that have a sign with an `is_primary = true` video are eligible: the query joins `words → signs → sign_videos`, and the last join (`sign_videos ... AND sv.is_primary`) is an inner join, so a word whose signs have no primary video simply has no matching row and is never returned — no explicit filtering logic needed. If the category/deck has zero eligible words, the function returns zero rows (not an error); callers treat an empty result as an "empty category" state, not a failure.

Deliberately has no "exclude previously shown word" parameter — repeats from a plain random draw are an acceptable, expected outcome for a drill feature, not a bug.

The standard-vs-custom lookup is a single `UNION ALL` with a boolean guard on each branch (`... AND NOT is_custom` / `... AND is_custom`), a plain-SQL stand-in for an if/else — exactly one branch's `WHERE` is satisfiable per call, since `is_custom` and `NOT is_custom` can't both hold. This extends the original category-only function in place rather than adding a second near-identical RPC for custom decks; the old single-argument overload was **dropped**, not left coexisting — `CREATE OR REPLACE` can't change a function's parameter list, so Postgres would otherwise have kept the old 1-arg overload alongside this one, and a call passing only `category_id` would then be ambiguous (matching the old exactly, and this one via `is_custom`'s default).

Not `SECURITY DEFINER`: it only reads `word_categories`/`custom_category_words`/`words`/`signs`/`sign_videos`. The standard-category branch relies on `word_categories`' plain `SELECT ... USING (true)` policy; the custom-deck branch relies on [`custom_category_words`](../rls-policies/custom_category_words/README.md)'s owner-scoped `select` policy, so a user passing someone else's custom deck id as `category_id` just gets zero rows back via that RLS, no extra ownership check needed here.

Not `STABLE`: it calls `random()`, which is genuinely volatile (different result on every call with the same input) — marking it `STABLE` would misrepresent that.

## Grants

- `EXECUTE` revoked from `PUBLIC` and from `anon` explicitly — as with [`is_superadmin`](./is_superadmin.md), this local environment grants new functions broad `EXECUTE` by default (including to `anon`), so revoking from `PUBLIC` alone would not exclude `anon`.
- `EXECUTE` granted to `authenticated` only (and `service_role`, which bypasses RLS/grants entirely).

## Current definition

*From `npx supabase db dump --local --schema public`:*

```sql
CREATE OR REPLACE FUNCTION "public"."get_random_word_for_category"("category_id" "uuid", "is_custom" boolean DEFAULT false) RETURNS TABLE("word_id" "uuid", "word" "text", "definition" "text", "storage_path" "text", "format" "text")
    LANGUAGE "sql"
    SET "search_path" TO 'public'
    AS $$
  SELECT
    w.id AS word_id,
    w.word,
    w.definition,
    sv.storage_path,
    sv.format
  FROM public.words w
  JOIN public.signs s ON s.word_id = w.id
  JOIN public.sign_videos sv ON sv.sign_id = s.id AND sv.is_primary
  WHERE w.id IN (
    SELECT word_id FROM public.word_categories
    WHERE category_id = get_random_word_for_category.category_id
      AND NOT get_random_word_for_category.is_custom
    UNION ALL
    SELECT word_id FROM public.custom_category_words
    WHERE custom_category_id = get_random_word_for_category.category_id
      AND get_random_word_for_category.is_custom
  )
  ORDER BY random()
  LIMIT 1;
$$;

COMMENT ON FUNCTION "public"."get_random_word_for_category"("category_id" "uuid", "is_custom" boolean) IS 'Returns one random word (with its primary sign video) in the given category or custom deck (is_custom selects which). Only words with an is_primary sign video are eligible. Returns zero rows if none are eligible.';

REVOKE ALL ON FUNCTION "public"."get_random_word_for_category"("category_id" "uuid", "is_custom" boolean) FROM PUBLIC;
REVOKE ALL ON FUNCTION "public"."get_random_word_for_category"("category_id" "uuid", "is_custom" boolean) FROM "anon";
GRANT ALL ON FUNCTION "public"."get_random_word_for_category"("category_id" "uuid", "is_custom" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_random_word_for_category"("category_id" "uuid", "is_custom" boolean) TO "service_role";
```
