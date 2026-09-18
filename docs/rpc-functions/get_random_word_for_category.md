# get_random_word_for_category

**Signature:** `public.get_random_word_for_category(category_id uuid) RETURNS TABLE(word_id uuid, word text, definition text, storage_path text, format text)`
**Language:** SQL
**Last touched by migration:** [`20260918153258_create_get_random_word_for_category_function.sql`](../../supabase/migrations/20260918153258_create_get_random_word_for_category_function.sql)

**Purpose:** Powers the flashcard game — given a category, returns one random word from it along with its primary sign video's storage path and format, for [FlashcardPage](../components/FlashcardPage.md) to render.

Only words that have a sign with an `is_primary = true` video are eligible: the query joins `word_categories → words → signs → sign_videos`, and the last join (`sign_videos ... AND sv.is_primary`) is an inner join, so a word whose signs have no primary video simply has no matching row and is never returned — no explicit filtering logic needed. If the category has zero eligible words, the function returns zero rows (not an error); callers treat an empty result as an "empty category" state, not a failure.

Deliberately has no "exclude previously shown word" parameter — repeats from a plain random draw are an acceptable, expected outcome for a drill feature, not a bug.

Not `SECURITY DEFINER`: it only reads `word_categories`/`words`/`signs`/`sign_videos`, which already grant `authenticated` a plain `SELECT ... USING (true)` policy, so running as the caller (the default) is sufficient — no need for the privilege-elevation `is_superadmin` requires to avoid RLS recursion.

Not `STABLE`: it calls `random()`, which is genuinely volatile (different result on every call with the same input) — marking it `STABLE` would misrepresent that.

## Grants

- `EXECUTE` revoked from `PUBLIC` and from `anon` explicitly — as with [`is_superadmin`](./is_superadmin.md), this local environment grants new functions broad `EXECUTE` by default (including to `anon`), so revoking from `PUBLIC` alone would not exclude `anon`.
- `EXECUTE` granted to `authenticated` only (and `service_role`, which bypasses RLS/grants entirely).

## Current definition

*From `npx supabase db dump --local --schema public`:*

```sql
CREATE OR REPLACE FUNCTION "public"."get_random_word_for_category"("category_id" "uuid") RETURNS TABLE("word_id" "uuid", "word" "text", "definition" "text", "storage_path" "text", "format" "text")
    LANGUAGE "sql"
    SET "search_path" TO 'public'
    AS $$
  SELECT
    w.id AS word_id,
    w.word,
    w.definition,
    sv.storage_path,
    sv.format
  FROM public.word_categories wc
  JOIN public.words w ON w.id = wc.word_id
  JOIN public.signs s ON s.word_id = w.id
  JOIN public.sign_videos sv ON sv.sign_id = s.id AND sv.is_primary
  WHERE wc.category_id = get_random_word_for_category.category_id
  ORDER BY random()
  LIMIT 1;
$$;

COMMENT ON FUNCTION "public"."get_random_word_for_category"("category_id" "uuid") IS 'Returns one random word (with its primary sign video) in the given category. Only words with an is_primary sign video are eligible. Returns zero rows if none are eligible.';

REVOKE ALL ON FUNCTION "public"."get_random_word_for_category"("category_id" "uuid") FROM PUBLIC;
REVOKE ALL ON FUNCTION "public"."get_random_word_for_category"("category_id" "uuid") FROM "anon";
GRANT ALL ON FUNCTION "public"."get_random_word_for_category"("category_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_random_word_for_category"("category_id" "uuid") TO "service_role";
```
