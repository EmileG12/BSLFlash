# get_random_words_for_category

**Signature:** `public.get_random_words_for_category(category_id uuid, card_count integer DEFAULT 10, is_custom boolean DEFAULT false) RETURNS TABLE(word_id uuid, word text, definition text, storage_path text, format text)`
**Language:** SQL
**Last touched by migration:** [`20261008143806_extend_random_word_functions_for_custom_decks.sql`](../../supabase/migrations/20261008143806_extend_random_word_functions_for_custom_decks.sql)

**Purpose:** Powers the "10 Cards" game mode — given a category or custom deck, returns up to `card_count` **distinct** random words (never repeating one within the same call), each with its primary sign video's storage path and format, for [TenCardsPage](../components/TenCardsPage.md) to draw a whole round up front. `is_custom` selects which deck table backs the lookup, same as [`get_random_word_for_category`](./get_random_word_for_category.md): `false` (the default) looks the id up in [`word_categories`](../db-schema/word_categories.md); `true` looks it up in [`custom_category_words`](../db-schema/custom_category_words.md).

Same eligibility rule as `get_random_word_for_category`: only words with an `is_primary = true` sign video are considered. First collapses to one row per distinct word via `SELECT DISTINCT ON (w.id) ... ORDER BY w.id, random()` (picking a random sign variant to represent each word), then applies a second, independent `ORDER BY random() LIMIT card_count` on top of that deduplicated set to choose which — and how many — words come back. If the category/deck has fewer than `card_count` eligible words, it simply returns all of them; callers don't need to handle an error for that case, only a possibly-shorter-than-requested array.

Same `UNION ALL` boolean-guard pattern as `get_random_word_for_category` for the standard-vs-custom branch, and the same reason the old two-argument overload was **dropped** rather than left alongside this one: `CREATE OR REPLACE` can't change a function's parameter list, so the old overload would otherwise make a call passing only `category_id`/`card_count` ambiguous against this one's `is_custom` default.

Not `SECURITY DEFINER` and not `STABLE`, for the same reasons as `get_random_word_for_category` (the custom-deck branch relies on [`custom_category_words`](../rls-policies/custom_category_words/README.md)'s owner-scoped RLS rather than an explicit ownership check; `random()` is genuinely volatile).

## Grants

- `EXECUTE` revoked from `PUBLIC` and from `anon` explicitly — same local-environment default-grant quirk as every other function here. Verified directly (pre-existing, under the old signature): an `anon`-authenticated call returns `42501 permission denied for function get_random_words_for_category`.
- `EXECUTE` granted to `authenticated` only (and `service_role`, which bypasses RLS/grants entirely).

## Current definition

*From `npx supabase db dump --local --schema public`:*

```sql
CREATE OR REPLACE FUNCTION "public"."get_random_words_for_category"("category_id" "uuid", "card_count" integer DEFAULT 10, "is_custom" boolean DEFAULT false) RETURNS TABLE("word_id" "uuid", "word" "text", "definition" "text", "storage_path" "text", "format" "text")
    LANGUAGE "sql"
    SET "search_path" TO 'public'
    AS $$
SELECT * FROM (
    SELECT DISTINCT ON (w.id)
        w.id AS "word_id", w.word, w.definition, sv.storage_path, sv.format
    FROM public.words w
    JOIN public.signs s ON s.word_id = w.id
    JOIN public.sign_videos sv ON sv.sign_id = s.id AND sv.is_primary
    WHERE w.id IN (
      SELECT word_id FROM public.word_categories
      WHERE category_id = get_random_words_for_category.category_id
        AND NOT get_random_words_for_category.is_custom
      UNION ALL
      SELECT word_id FROM public.custom_category_words
      WHERE custom_category_id = get_random_words_for_category.category_id
        AND get_random_words_for_category.is_custom
    )
    ORDER BY w.id, random()
) AS eligible_words
ORDER BY random()
LIMIT get_random_words_for_category.card_count;
$$;

COMMENT ON FUNCTION "public"."get_random_words_for_category"("category_id" "uuid", "card_count" integer, "is_custom" boolean) IS 'Returns up to card_count distinct random words (with primary sign videos) in the given category or custom deck (is_custom selects which), for the 10 Cards game mode. Never repeats a word within one call; returns fewer rows if fewer than card_count are eligible.';

REVOKE ALL ON FUNCTION "public"."get_random_words_for_category"("category_id" "uuid", "card_count" integer, "is_custom" boolean) FROM PUBLIC;
REVOKE ALL ON FUNCTION "public"."get_random_words_for_category"("category_id" "uuid", "card_count" integer, "is_custom" boolean) FROM "anon";
GRANT ALL ON FUNCTION "public"."get_random_words_for_category"("category_id" "uuid", "card_count" integer, "is_custom" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_random_words_for_category"("category_id" "uuid", "card_count" integer, "is_custom" boolean) TO "service_role";
```
