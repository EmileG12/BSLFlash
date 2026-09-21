# get_random_words_for_category

**Signature:** `public.get_random_words_for_category(category_id uuid, card_count integer DEFAULT 10) RETURNS TABLE(word_id uuid, word text, definition text, storage_path text, format text)`
**Language:** SQL
**Last touched by migration:** [`20260919212853_create_get_random_words_for_category_function.sql`](../../supabase/migrations/20260919212853_create_get_random_words_for_category_function.sql)

**Purpose:** Powers the "10 Cards" game mode — given a category, returns up to `card_count` **distinct** random words (never repeating one within the same call), each with its primary sign video's storage path and format, for [TenCardsPage](../components/TenCardsPage.md) to draw a whole round up front.

Same eligibility rule as [`get_random_word_for_category`](./get_random_word_for_category.md): only words with an `is_primary = true` sign video are considered. Unlike that function, this one first collapses to one row per distinct word via `SELECT DISTINCT ON (w.id) ... ORDER BY w.id, random()` (picking a random sign variant to represent each word), then applies a second, independent `ORDER BY random() LIMIT card_count` on top of that deduplicated set to choose which — and how many — words come back. If the category has fewer than `card_count` eligible words, it simply returns all of them; callers don't need to handle an error for that case, only a possibly-shorter-than-requested array.

Not `SECURITY DEFINER` and not `STABLE`, for the same reasons as `get_random_word_for_category` (no RLS-recursion risk to avoid; `random()` is genuinely volatile).

## Grants

- `EXECUTE` revoked from `PUBLIC` and from `anon` explicitly — same local-environment default-grant quirk as every other function here. Verified directly: an `anon`-authenticated call returns `42501 permission denied for function get_random_words_for_category`.
- `EXECUTE` granted to `authenticated` only (and `service_role`, which bypasses RLS/grants entirely).

## Current definition

*Function body and comment from `npx supabase db dump --local --schema public` (identical to the migration); grants from the migration itself, since `pg_dump`'s ACL output only restates a `REVOKE` when a role still has a residual grant to remove — `anon` has none here, so nothing appears in the dump for it, even though the revoke is in effect (verified above).*

```sql
CREATE OR REPLACE FUNCTION "public"."get_random_words_for_category"("category_id" "uuid", "card_count" integer DEFAULT 10) RETURNS TABLE("word_id" "uuid", "word" "text", "definition" "text", "storage_path" "text", "format" "text")
    LANGUAGE "sql"
    SET "search_path" TO 'public'
    AS $$
SELECT * FROM (
    SELECT DISTINCT ON (w.id)
        w.id AS "word_id", w.word, w.definition, sv.storage_path, sv.format
    FROM public.word_categories wc
    JOIN public.words w ON w.id = wc.word_id
    JOIN public.signs s ON s.word_id = w.id
    JOIN public.sign_videos sv ON sv.sign_id = s.id AND sv.is_primary
    WHERE wc.category_id = get_random_words_for_category.category_id
    ORDER BY w.id, random()
) AS eligible_words
ORDER BY random()
LIMIT get_random_words_for_category.card_count;
$$;

COMMENT ON FUNCTION "public"."get_random_words_for_category"("category_id" "uuid", "card_count" integer) IS 'Returns up to card_count distinct random words (with primary sign videos) in the given category, for the 10 Cards game mode. Never repeats a word within one call; returns fewer rows if the category has fewer than card_count eligible words.';

REVOKE ALL ON FUNCTION "public"."get_random_words_for_category"("category_id" "uuid", "card_count" integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION "public"."get_random_words_for_category"("category_id" "uuid", "card_count" integer) FROM "anon";
GRANT ALL ON FUNCTION "public"."get_random_words_for_category"("category_id" "uuid", "card_count" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_random_words_for_category"("category_id" "uuid", "card_count" integer) TO "service_role";
```
