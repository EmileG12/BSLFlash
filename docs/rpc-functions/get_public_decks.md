# get_public_decks

**Signature:** `public.get_public_decks(p_search text DEFAULT NULL, p_tag_ids uuid[] DEFAULT NULL, p_sort text DEFAULT 'likes') RETURNS TABLE(id uuid, deck_name text, owner_user_id uuid, owner_name text, tag_names text[], like_count bigint, liked_by_me boolean, saved_by_me boolean, created_at timestamptz)`
**Language:** SQL
**Last touched by migration:** [`20261011163011_create_get_public_decks_function.sql`](../../supabase/migrations/20261011163011_create_get_public_decks_function.sql)

**Purpose:** Lists published [`custom_decks`](../db-schema/custom_decks.md) (`is_public = true`) for the [BrowseDecksPage](../components/BrowseDecksPage.md) directory. Each row carries the deck's owner name, its tag names, its like count, and whether the calling user has liked or saved it, so one call renders a full card.

**Filtering:**
- `p_search`: case-insensitive substring match (`ILIKE`) on `deck_name`. `NULL` or empty skips the filter.
- `p_tag_ids`: AND semantics — a deck is returned only if it has **every** listed tag. Implemented as a `NOT EXISTS` over the unnested tag ids, with an inner `NOT EXISTS` against [`custom_deck_tags`](../db-schema/custom_deck_tags.md) (a deck fails if any listed tag is missing). `NULL` or an empty array skips the filter.

**Sorting:** `p_sort` is one of `'likes'` (default), `'newest'`, or `'name'`. Each option is a `CASE` expression that is `NULL` for every row unless selected, so unselected branches fall through to the next `ORDER BY` term without dynamic SQL. The final ordering is: newest (`created_at` desc), then name (asc), then like count (desc), then `deck_name` (asc). For `'likes'`, only the like-count and name terms take effect.

**Owner name:** `owner_name` comes from a `LEFT JOIN` to [`profiles`](../db-schema/profiles.md). The function runs as the caller, so this relies on [`profiles_select_public_deck_owner`](../rls-policies/profiles/profiles_select_public_deck_owner.md) to make the owner's profile readable.

`liked_by_me` and `saved_by_me` are evaluated against `auth.uid()`, so the result is per-caller even though the function is not `SECURITY DEFINER`.

`STABLE`: no volatile calls; the same input returns the same rows within a statement.

Not `SECURITY DEFINER`: it reads `custom_decks`, `custom_deck_tags`, `deck_likes`, `saved_decks` and `profiles` under the caller's RLS. Visibility is therefore the same as a direct query: public decks, their tags and likes, and the owner profile for them.

## Grants

- `EXECUTE` revoked from `PUBLIC` and from `anon` explicitly — same local-environment default-grant quirk as every other function here.
- `EXECUTE` granted to `authenticated` only (and `service_role`).

## Current definition

*Reconstructed from the migration, not from a live dump. Verify against `npx supabase db dump --local --schema public`.*

```sql
CREATE OR REPLACE FUNCTION "public"."get_public_decks"("p_search" "text" DEFAULT NULL::"text", "p_tag_ids" "uuid"[] DEFAULT NULL::"uuid"[], "p_sort" "text" DEFAULT 'likes'::"text") RETURNS TABLE("id" "uuid", "deck_name" "text", "owner_user_id" "uuid", "owner_name" "text", "tag_names" "text"[], "like_count" bigint, "liked_by_me" boolean, "saved_by_me" boolean, "created_at" timestamp with time zone)
    LANGUAGE "sql" STABLE
    SET "search_path" TO 'public'
    AS $$
  SELECT
    cd.id,
    cd.deck_name,
    cd.user_id AS owner_user_id,
    p.user_name AS owner_name,
    COALESCE(
      (SELECT array_agg(c.category_name ORDER BY c.category_name)
       FROM public.custom_deck_tags cdt
       JOIN public.categories c ON c.id = cdt.category_id
       WHERE cdt.custom_deck_id = cd.id),
      ARRAY[]::text[]
    ) AS tag_names,
    (SELECT count(*) FROM public.deck_likes dl WHERE dl.custom_deck_id = cd.id) AS like_count,
    EXISTS (
      SELECT 1 FROM public.deck_likes dl
      WHERE dl.custom_deck_id = cd.id AND dl.user_id = auth.uid()
    ) AS liked_by_me,
    EXISTS (
      SELECT 1 FROM public.saved_decks sd
      WHERE sd.custom_deck_id = cd.id AND sd.user_id = auth.uid()
    ) AS saved_by_me,
    cd.created_at
  FROM public.custom_decks cd
  LEFT JOIN public.profiles p ON p.user_id = cd.user_id
  WHERE cd.is_public
    AND (
      get_public_decks.p_search IS NULL OR get_public_decks.p_search = ''
      OR cd.deck_name ILIKE '%' || get_public_decks.p_search || '%'
    )
    AND (
      get_public_decks.p_tag_ids IS NULL OR array_length(get_public_decks.p_tag_ids, 1) IS NULL
      OR NOT EXISTS (
        SELECT 1 FROM unnest(get_public_decks.p_tag_ids) AS tag_id
        WHERE NOT EXISTS (
          SELECT 1 FROM public.custom_deck_tags cdt
          WHERE cdt.custom_deck_id = cd.id AND cdt.category_id = tag_id
        )
      )
    )
  ORDER BY
    (CASE WHEN get_public_decks.p_sort = 'newest' THEN cd.created_at END) DESC NULLS LAST,
    (CASE WHEN get_public_decks.p_sort = 'name' THEN cd.deck_name END) ASC NULLS LAST,
    (SELECT count(*) FROM public.deck_likes dl WHERE dl.custom_deck_id = cd.id) DESC,
    cd.deck_name ASC;
$$;

COMMENT ON FUNCTION "public"."get_public_decks"("p_search" "text", "p_tag_ids" "uuid"[], "p_sort" "text") IS 'Lists public custom decks for the Browse directory, with optional name search and AND-semantics tag filtering, sorted by like count desc (p_sort=''likes'', the default), newest (''newest''), or name (''name'').';

REVOKE ALL ON FUNCTION "public"."get_public_decks"("p_search" "text", "p_tag_ids" "uuid"[], "p_sort" "text") FROM PUBLIC;
REVOKE ALL ON FUNCTION "public"."get_public_decks"("p_search" "text", "p_tag_ids" "uuid"[], "p_sort" "text") FROM "anon";
GRANT ALL ON FUNCTION "public"."get_public_decks"("p_search" "text", "p_tag_ids" "uuid"[], "p_sort" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_public_decks"("p_search" "text", "p_tag_ids" "uuid"[], "p_sort" "text") TO "service_role";
```

**Used by:** [usePublicDecks](../hooks/usePublicDecks.md).
