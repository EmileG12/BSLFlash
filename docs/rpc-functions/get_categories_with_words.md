# get_categories_with_words

**Signature:** `public.get_categories_with_words(p_is_vocabulary boolean) RETURNS TABLE(id uuid, category_name text, is_vocabulary boolean)`
**Language:** SQL
**Last touched by migration:** [`20261011162531_add_get_categories_with_words_function.sql`](../../supabase/migrations/20261011162531_add_get_categories_with_words_function.sql)

**Purpose:** Returns the [`categories`](../db-schema/categories.md) rows matching `p_is_vocabulary` that have at least one word linked via [`word_categories`](../db-schema/word_categories.md), ordered by name. It backs [useCategories](../hooks/useCategories.md), which feeds the standard deck-selection menus. A `categories` row can exist purely as a deck tag ([`custom_deck_tags`](../db-schema/custom_deck_tags.md)) with no words; the `EXISTS` filter keeps those out of the word-deck menus. A plain `from('categories')` read would not exclude them.

`STABLE`: reads the same data for the same input within one statement and has no `random()`.

Not `SECURITY DEFINER`: it reads only `categories` and `word_categories`, both covered by their plain "any authenticated user can read" policies.

## Grants

- `EXECUTE` revoked from `PUBLIC` and from `anon` explicitly — same local-environment default-grant quirk as every other function here.
- `EXECUTE` granted to `authenticated` only (and `service_role`).

## Current definition

*Reconstructed from the migration, not from a live dump. Verify against `npx supabase db dump --local --schema public`.*

```sql
CREATE OR REPLACE FUNCTION "public"."get_categories_with_words"("p_is_vocabulary" boolean) RETURNS TABLE("id" "uuid", "category_name" "text", "is_vocabulary" boolean)
    LANGUAGE "sql" STABLE
    SET "search_path" TO 'public'
    AS $$
  SELECT c.id, c.category_name, c.is_vocabulary
  FROM public.categories c
  WHERE c.is_vocabulary = get_categories_with_words.p_is_vocabulary
    AND EXISTS (SELECT 1 FROM public.word_categories wc WHERE wc.category_id = c.id)
  ORDER BY c.category_name;
$$;

COMMENT ON FUNCTION "public"."get_categories_with_words"("p_is_vocabulary" boolean) IS 'Returns categories matching p_is_vocabulary that have at least one word linked via word_categories -- excludes tag-only categories (ones that exist solely to tag custom decks via custom_deck_tags) from the standard deck-selection menus.';

REVOKE ALL ON FUNCTION "public"."get_categories_with_words"("p_is_vocabulary" boolean) FROM PUBLIC;
REVOKE ALL ON FUNCTION "public"."get_categories_with_words"("p_is_vocabulary" boolean) FROM "anon";
GRANT ALL ON FUNCTION "public"."get_categories_with_words"("p_is_vocabulary" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_categories_with_words"("p_is_vocabulary" boolean) TO "service_role";
```

**Used by:** [useCategories](../hooks/useCategories.md).
