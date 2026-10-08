# create_custom_category

**Signature:** `public.create_custom_category(p_name text, p_word_ids uuid[]) RETURNS uuid`
**Language:** plpgsql
**Last touched by migration:** [`20261008170826_dedupe_create_custom_category_word_ids.sql`](../../supabase/migrations/20261008170826_dedupe_create_custom_category_word_ids.sql)

**Purpose:** Creates a custom deck owned by the calling user — inserts the [`custom_categories`](../db-schema/custom_categories.md) header row (name only; `user_id` defaults to `auth.uid()`) and every [`custom_category_words`](../db-schema/custom_category_words.md) link, in one call. Used by [CreateDeckPage](../components/CreateDeckPage.md)'s "Confirm" flow.

Written in `plpgsql` (not plain `sql`, unlike [`get_random_word_for_category`](./get_random_word_for_category.md)/[`get_random_words_for_category`](./get_random_words_for_category.md)) specifically so the header insert and the word-link inserts run inside one atomic transaction — a mid-insert failure can never leave an orphaned empty deck or a deck with only some of its words linked.

Raises an exception (and rolls back) if `p_name` is blank (`btrim(p_name) = ''`) or `p_word_ids` is null/empty (`array_length(p_word_ids, 1) IS NULL`) — both checked before either insert runs.

A duplicate id in `p_word_ids` is silently deduped (`ON CONFLICT (custom_category_id, word_id) DO NOTHING`) rather than failing the call — `custom_category_words`' primary key is `(custom_category_id, word_id)`, so without this the whole RPC would abort on a PK violation instead of just not double-linking the word. Not reachable via the current frontend ([CreateDeckPage](../components/CreateDeckPage.md) already excludes already-selected words from what it can pass), but the RPC enforces the invariant itself rather than depending entirely on caller behavior.

Not `SECURITY DEFINER`: it runs as the calling user, so the [`custom_categories`](../rls-policies/custom_categories/README.md)/[`custom_category_words`](../rls-policies/custom_category_words/README.md) RLS policies (ownership via `user_id = auth.uid()`) apply exactly as if the two inserts had been issued directly by the client — a user can only ever create a deck for themselves, the same guarantee `custom_categories.user_id`'s own default provides.

## Grants

- `EXECUTE` revoked from `PUBLIC` and from `anon` explicitly — same local-environment default-grant pattern as every other function here (see [`is_superadmin`](./is_superadmin.md)).
- `EXECUTE` granted to `authenticated` only (and `service_role`, which bypasses RLS/grants entirely).

## Current definition

*From `npx supabase db dump --local --schema public`:*

```sql
CREATE OR REPLACE FUNCTION "public"."create_custom_category"("p_name" "text", "p_word_ids" "uuid"[]) RETURNS "uuid"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_id uuid;
BEGIN
  IF btrim(p_name) = '' THEN
    RAISE EXCEPTION 'p_name must not be blank';
  END IF;

  IF p_word_ids IS NULL OR array_length(p_word_ids, 1) IS NULL THEN
    RAISE EXCEPTION 'p_word_ids must contain at least one word';
  END IF;

  INSERT INTO public.custom_categories (category_name)
  VALUES (p_name)
  RETURNING id INTO v_id;

  INSERT INTO public.custom_category_words (custom_category_id, word_id)
  SELECT v_id, word_id FROM unnest(p_word_ids) AS word_id
  ON CONFLICT (custom_category_id, word_id) DO NOTHING;

  RETURN v_id;
END;
$$;

COMMENT ON FUNCTION "public"."create_custom_category"("p_name" "text", "p_word_ids" "uuid"[]) IS 'Creates a custom deck owned by the calling user (custom_categories.user_id defaults to auth.uid()) with the given name and word links, atomically. Raises if p_name is blank or p_word_ids is empty. Duplicate ids in p_word_ids are silently deduped (ON CONFLICT DO NOTHING) rather than failing the whole call.';

REVOKE ALL ON FUNCTION "public"."create_custom_category"("p_name" "text", "p_word_ids" "uuid"[]) FROM PUBLIC;
REVOKE ALL ON FUNCTION "public"."create_custom_category"("p_name" "text", "p_word_ids" "uuid"[]) FROM "anon";
GRANT ALL ON FUNCTION "public"."create_custom_category"("p_name" "text", "p_word_ids" "uuid"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_custom_category"("p_name" "text", "p_word_ids" "uuid"[]) TO "service_role";
```

**Used by:** [CreateDeckPage](../components/CreateDeckPage.md).
