# get_random_words_for_category

**Signature:** `public.get_random_words_for_category(category_id uuid, card_count integer DEFAULT 10, is_custom boolean DEFAULT false, subcategory_id uuid DEFAULT NULL) RETURNS TABLE(word_id uuid, word text, definition text, storage_path text, format text)`
**Language:** SQL
**Last touched by migration:** [`20261011162150_rename_custom_categories_to_custom_decks.sql`](../../supabase/migrations/20261011162150_rename_custom_categories_to_custom_decks.sql)

**Purpose:** Powers the "10 Cards" game mode — given a category or custom deck, returns up to `card_count` **distinct** random words (never repeating one within the same call), each with its primary sign video's storage path and format, for [TenCardsPage](../components/TenCardsPage.md) to draw a whole round up front. `is_custom` selects which deck table backs the lookup, same as [`get_random_word_for_category`](./get_random_word_for_category.md): `false` (the default) looks the id up in [`word_categories`](../db-schema/word_categories.md); `true` looks it up in [`custom_deck_words`](../db-schema/custom_deck_words.md).

`subcategory_id`, when given, further restricts the eligible set to words that *also* belong to that topic category — the same second `word_categories` membership check, intersected with the existing predicate, as [`get_random_word_for_category`](./get_random_word_for_category.md). Defaults to `NULL`, which skips the check, so pre-existing callers are unaffected.

Same eligibility rule as `get_random_word_for_category`: only words with an `is_primary = true` sign video are considered. First collapses to one row per distinct word via `SELECT DISTINCT ON (w.id) ... ORDER BY w.id, random()` (picking a random sign variant to represent each word), then applies a second, independent `ORDER BY random() LIMIT card_count` on top of that deduplicated set to choose which — and how many — words come back. If the category/deck (and subcategory, if given) has fewer than `card_count` eligible words, it simply returns all of them; callers don't need to handle an error for that case, only a possibly-shorter-than-requested array.

Same `UNION ALL` boolean-guard pattern as `get_random_word_for_category` for the standard-vs-custom branch, and the same reason the old overloads were **dropped** rather than left alongside this one: `CREATE OR REPLACE` can't change a function's parameter list, so an old overload would otherwise make a call passing only `category_id`/`card_count`/`is_custom` ambiguous against this one's `subcategory_id` default.

The body refers to `custom_deck_words` and `custom_deck_id` by name, so it must be recreated explicitly if those names change — Postgres does not rewrite function bodies on rename.

Not `SECURITY DEFINER` and not `STABLE`, for the same reasons as `get_random_word_for_category` (the custom-deck branch relies on [`custom_deck_words`](../rls-policies/custom_deck_words/README.md)'s select policies rather than an explicit ownership check; `random()` is genuinely volatile).

## Grants

- `EXECUTE` revoked from `PUBLIC` and from `anon` explicitly — same local-environment default-grant quirk as every other function here. Verified directly (pre-existing, under the old signature): an `anon`-authenticated call returns `42501 permission denied for function get_random_words_for_category`.
- `EXECUTE` granted to `authenticated` only (and `service_role`, which bypasses RLS/grants entirely).

## Current definition

*Reconstructed from the rename migration (which recreates this body), not from a live dump. Verify against `npx supabase db dump --local --schema public`.*

```sql
CREATE OR REPLACE FUNCTION "public"."get_random_words_for_category"("category_id" "uuid", "card_count" integer DEFAULT 10, "is_custom" boolean DEFAULT false, "subcategory_id" "uuid" DEFAULT NULL::"uuid") RETURNS TABLE("word_id" "uuid", "word" "text", "definition" "text", "storage_path" "text", "format" "text")
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
      SELECT word_id FROM public.custom_deck_words
      WHERE custom_deck_id = get_random_words_for_category.category_id
        AND get_random_words_for_category.is_custom
    )
    AND (
      get_random_words_for_category.subcategory_id IS NULL
      OR w.id IN (
        SELECT word_id FROM public.word_categories
        WHERE category_id = get_random_words_for_category.subcategory_id
      )
    )
    ORDER BY w.id, random()
) AS eligible_words
ORDER BY random()
LIMIT get_random_words_for_category.card_count;
$$;

COMMENT ON FUNCTION "public"."get_random_words_for_category"("category_id" "uuid", "card_count" integer, "is_custom" boolean, "subcategory_id" "uuid") IS 'Returns up to card_count distinct random words (with primary sign videos) in the given category or custom deck (is_custom selects which), optionally also restricted to subcategory_id via word_categories, for the 10 Cards game mode. Never repeats a word within one call; returns fewer rows if fewer than card_count are eligible.';

REVOKE ALL ON FUNCTION "public"."get_random_words_for_category"("category_id" "uuid", "card_count" integer, "is_custom" boolean, "subcategory_id" "uuid") FROM PUBLIC;
REVOKE ALL ON FUNCTION "public"."get_random_words_for_category"("category_id" "uuid", "card_count" integer, "is_custom" boolean, "subcategory_id" "uuid") FROM "anon";
GRANT ALL ON FUNCTION "public"."get_random_words_for_category"("category_id" "uuid", "card_count" integer, "is_custom" boolean, "subcategory_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_random_words_for_category"("category_id" "uuid", "card_count" integer, "is_custom" boolean, "subcategory_id" "uuid") TO "service_role";
```
