# get_available_deck_tags

**Signature:** `public.get_available_deck_tags() RETURNS TABLE(id uuid, category_name text)`
**Language:** SQL
**Last touched by migration:** [`20261011163011_create_get_public_decks_function.sql`](../../supabase/migrations/20261011163011_create_get_public_decks_function.sql)

**Purpose:** Returns the [`categories`](../db-schema/categories.md) rows currently tagging at least one published [`custom_decks`](../db-schema/custom_decks.md) row, ordered by name. It feeds the tag chips in the [BrowseDecksPage](../components/BrowseDecksPage.md) filter bar via [useAvailableDeckTags](../hooks/useAvailableDeckTags.md). A tag with no published decks is excluded, so the filter never offers a choice that would return an empty directory. This is the same reasoning as [`get_available_subcategories_for_category`](./get_available_subcategories_for_category.md).

Deck creation and editing do not use this function; it is only consumed by the directory filter.

`STABLE`, no `random()` call. Not `SECURITY DEFINER`: it reads `categories`, `custom_deck_tags` and `custom_decks` under the caller's RLS, so only tags on decks the caller can see as published are counted.

## Grants

- `EXECUTE` revoked from `PUBLIC` and from `anon` explicitly — same local-environment default-grant quirk as every other function here.
- `EXECUTE` granted to `authenticated` only (and `service_role`).

## Current definition

*Reconstructed from the migration, not from a live dump. Verify against `npx supabase db dump --local --schema public`.*

```sql
CREATE OR REPLACE FUNCTION "public"."get_available_deck_tags"() RETURNS TABLE("id" "uuid", "category_name" "text")
    LANGUAGE "sql" STABLE
    SET "search_path" TO 'public'
    AS $$
  SELECT DISTINCT c.id, c.category_name
  FROM public.categories c
  JOIN public.custom_deck_tags cdt ON cdt.category_id = c.id
  JOIN public.custom_decks cd ON cd.id = cdt.custom_deck_id
  WHERE cd.is_public
  ORDER BY c.category_name;
$$;

COMMENT ON FUNCTION "public"."get_available_deck_tags"() IS 'Returns the categories currently tagging at least one public custom deck, for the Browse directory''s tag filter chips. Excludes tags with zero matching public decks.';

REVOKE ALL ON FUNCTION "public"."get_available_deck_tags"() FROM PUBLIC;
REVOKE ALL ON FUNCTION "public"."get_available_deck_tags"() FROM "anon";
GRANT ALL ON FUNCTION "public"."get_available_deck_tags"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_available_deck_tags"() TO "service_role";
```

**Used by:** [useAvailableDeckTags](../hooks/useAvailableDeckTags.md).
