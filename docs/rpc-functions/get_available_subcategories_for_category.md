# get_available_subcategories_for_category

**Signature:** `public.get_available_subcategories_for_category(category_id uuid) RETURNS TABLE(id uuid, category_name text)`
**Language:** SQL
**Last touched by migration:** [`20261011135343_add_subcategory_filtering.sql`](../../supabase/migrations/20261011135343_add_subcategory_filtering.sql)

**Purpose:** Returns the topic categories (`is_vocabulary = false`) that share at least one word with the given category, for [SubCategoryChips](../components/SubCategoryChips.md) to offer as "narrow by topic" choices on [ModeSelectPage](../components/ModeSelectPage.md). Exists specifically so a subcategory with zero overlapping words never appears as a choice at all — not shown and then found empty once picked.

Finds the overlap via a self-join on [`word_categories`](../db-schema/word_categories.md) (`wc1` fixed to `category_id`, `wc2` fixed to each candidate topic category `c`, joined on `word_id`): a row survives the `EXISTS` only if at least one word links to both. This is the same table [`get_random_word_for_category`](./get_random_word_for_category.md)/[`get_random_words_for_category`](./get_random_words_for_category.md) intersect against when `subcategory_id` is actually applied at play time — this function only decides which subcategory ids are legal to pass to those.

`STABLE`: unlike the two random-word RPCs, this reads the same data for the same input within one statement/transaction and has no `random()` call, so marking it `STABLE` is accurate (and lets Postgres cache repeated calls within a query).

Not `SECURITY DEFINER`: it only reads `categories`/`word_categories`, both covered by [`categories`](../db-schema/categories.md)'s/[`word_categories`](../db-schema/word_categories.md)'s plain "any authenticated user can read" RLS policies.

## Grants

- `EXECUTE` revoked from `PUBLIC` and from `anon` explicitly — same local-environment default-grant quirk as every other function here.
- `EXECUTE` granted to `authenticated` only (and `service_role`, which bypasses RLS/grants entirely).

## Current definition

```sql
CREATE OR REPLACE FUNCTION "public"."get_available_subcategories_for_category"("category_id" "uuid") RETURNS TABLE("id" "uuid", "category_name" "text")
    LANGUAGE "sql" STABLE
    SET "search_path" TO 'public'
    AS $$
  SELECT c.id, c.category_name
  FROM public.categories c
  WHERE c.is_vocabulary = false
    AND EXISTS (
      SELECT 1 FROM public.word_categories wc1
      JOIN public.word_categories wc2 ON wc1.word_id = wc2.word_id
      WHERE wc1.category_id = get_available_subcategories_for_category.category_id
        AND wc2.category_id = c.id
    )
  ORDER BY c.category_name;
$$;

COMMENT ON FUNCTION "public"."get_available_subcategories_for_category"("category_id" "uuid") IS 'Returns the topic categories (is_vocabulary = false) that share at least one word with the given category, for narrowing a vocabulary category''s word pool by subcategory. Excludes topic categories with zero overlapping words.';

REVOKE ALL ON FUNCTION "public"."get_available_subcategories_for_category"("category_id" "uuid") FROM PUBLIC;
REVOKE ALL ON FUNCTION "public"."get_available_subcategories_for_category"("category_id" "uuid") FROM "anon";
GRANT ALL ON FUNCTION "public"."get_available_subcategories_for_category"("category_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_available_subcategories_for_category"("category_id" "uuid") TO "service_role";
```

Verified against a live `npx supabase db dump --local --schema public` on 2026-10-11 — matches the migration's text exactly.
