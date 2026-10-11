# get_random_word_for_category

**Signature:** `public.get_random_word_for_category(category_id uuid, is_custom boolean DEFAULT false, subcategory_id uuid DEFAULT NULL) RETURNS TABLE(word_id uuid, word text, definition text, storage_path text, format text)`
**Language:** SQL
**Last touched by migration:** [`20261011193933_rewrite_random_word_functions_for_sign_level_primary.sql`](../../supabase/migrations/20261011193933_rewrite_random_word_functions_for_sign_level_primary.sql)

**Purpose:** Powers the flashcard game — given a category or custom deck, returns one random word from it along with its primary sign video's storage path and format, for [FlashcardPage](../components/FlashcardPage.md) to render. `is_custom` selects which: `false` (the default) looks the id up in [`word_categories`](../db-schema/word_categories.md) (a `public.categories` row); `true` looks it up in [`custom_deck_words`](../db-schema/custom_deck_words.md) (a `custom_decks` row).

`subcategory_id`, when given, further restricts the result to words that *also* belong to that topic category — a second membership check against [`word_categories`](../db-schema/word_categories.md), intersected with the existing category-membership predicate. This reuses `word_categories` as-is rather than a new join table: a word already links to both its topic category and a vocabulary category through that one table, so narrowing by subcategory is just two `IN` checks against the same table. Defaults to `NULL`, which skips the check entirely, so every pre-existing call site (only ever passing `category_id`/`is_custom`) keeps matching the whole category unchanged. [SubCategoryChips](../components/SubCategoryChips.md)/[`get_available_subcategories_for_category`](./get_available_subcategories_for_category.md) is what keeps a caller from ever passing a `subcategory_id` that would zero out the result.

Only a word's primary sign variant is considered (`signs.is_primary = true`, see [`signs`](../db-schema/signs.md)), and one of that variant's videos is picked at random on each call — so a learner can't come to recognise one specific take rather than the sign itself. The query joins `words → signs (is_primary) → sign_videos` with inner joins, so a word whose primary variant has no video simply has no matching row and is never returned.

The eligible set is collapsed to one row per word (`SELECT DISTINCT ON (w.id) ... ORDER BY w.id, random()`) before the final `ORDER BY random() LIMIT 1`. Without that first step, a word with more videos would have more rows in the pool and so would be drawn more often; the two-level pattern makes every eligible word equally likely. The 10 Cards sibling, [`get_random_words_for_category`](./get_random_words_for_category.md), uses the same pattern. If the category/deck (and subcategory, if given) has zero eligible words, the function returns zero rows (not an error); callers treat an empty result as an "empty category" state, not a failure.

Deliberately has no "exclude previously shown word" parameter — repeats from a plain random draw are an acceptable, expected outcome for a drill feature, not a bug.

The standard-vs-custom lookup is a single `UNION ALL` with a boolean guard on each branch (`... AND NOT is_custom` / `... AND is_custom`), a plain-SQL stand-in for an if/else — exactly one branch's `WHERE` is satisfiable per call, since `is_custom` and `NOT is_custom` can't both hold. This extends the original category-only function in place rather than adding a second near-identical RPC for custom decks; the old overloads were **dropped**, not left coexisting — `CREATE OR REPLACE` can't change a function's parameter list, so Postgres would otherwise have kept an old overload alongside this one, and a call passing only `category_id`/`is_custom` would then be ambiguous (matching the old exactly, and this one via `subcategory_id`'s default).

The body refers to `custom_deck_words` and `custom_deck_id` by name. Postgres does not rewrite a function body when a table or column is renamed (bodies are stored as plain text, unlike RLS expressions), so this function must be recreated explicitly whenever those names change.

Not `SECURITY DEFINER`: it only reads `word_categories`/`custom_deck_words`/`words`/`signs`/`sign_videos`. The standard-category branch relies on `word_categories`' plain `SELECT ... USING (true)` policy; the custom-deck branch relies on [`custom_deck_words`](../rls-policies/custom_deck_words/README.md)' select policies, so a caller gets the words of a deck they own, or of any published deck, and zero rows for anyone else's unpublished deck — no extra ownership check needed here.

Not `STABLE`: it calls `random()`, which is genuinely volatile (different result on every call with the same input) — marking it `STABLE` would misrepresent that.

## Grants

- `EXECUTE` revoked from `PUBLIC` and from `anon` explicitly — as with [`is_superadmin`](./is_superadmin.md), this local environment grants new functions broad `EXECUTE` by default (including to `anon`), so revoking from `PUBLIC` alone would not exclude `anon`.
- `EXECUTE` granted to `authenticated` only (and `service_role`, which bypasses RLS/grants entirely).

## Current definition

*Derived from the migrations (`20261011193933_rewrite_random_word_functions_for_sign_level_primary.sql`); to be confirmed against `npx supabase db dump --local --schema public`.*

```sql
CREATE OR REPLACE FUNCTION "public"."get_random_word_for_category"("category_id" "uuid", "is_custom" boolean DEFAULT false, "subcategory_id" "uuid" DEFAULT NULL::"uuid") RETURNS TABLE("word_id" "uuid", "word" "text", "definition" "text", "storage_path" "text", "format" "text")
    LANGUAGE "sql"
    SET "search_path" TO 'public'
    AS $$
  SELECT * FROM (
    SELECT DISTINCT ON (w.id)
      w.id AS word_id,
      w.word,
      w.definition,
      sv.storage_path,
      sv.format
    FROM public.words w
    JOIN public.signs s ON s.word_id = w.id AND s.is_primary
    JOIN public.sign_videos sv ON sv.sign_id = s.id
    WHERE w.id IN (
      SELECT word_id FROM public.word_categories
      WHERE category_id = get_random_word_for_category.category_id
        AND NOT get_random_word_for_category.is_custom
      UNION ALL
      SELECT word_id FROM public.custom_deck_words
      WHERE custom_deck_id = get_random_word_for_category.category_id
        AND get_random_word_for_category.is_custom
    )
    AND (
      get_random_word_for_category.subcategory_id IS NULL
      OR w.id IN (
        SELECT word_id FROM public.word_categories
        WHERE category_id = get_random_word_for_category.subcategory_id
      )
    )
    ORDER BY w.id, random()
  ) AS eligible_words
  ORDER BY random()
  LIMIT 1;
$$;

COMMENT ON FUNCTION "public"."get_random_word_for_category"("category_id" "uuid", "is_custom" boolean, "subcategory_id" "uuid") IS 'Returns one random word (with a random video from its primary sign variant) in the given category or custom deck (is_custom selects which), optionally restricted to subcategory_id via word_categories. Only words whose primary variant has at least one video are eligible. Returns zero rows if none are eligible.';

REVOKE ALL ON FUNCTION "public"."get_random_word_for_category"("category_id" "uuid", "is_custom" boolean, "subcategory_id" "uuid") FROM PUBLIC;
REVOKE ALL ON FUNCTION "public"."get_random_word_for_category"("category_id" "uuid", "is_custom" boolean, "subcategory_id" "uuid") FROM "anon";
GRANT ALL ON FUNCTION "public"."get_random_word_for_category"("category_id" "uuid", "is_custom" boolean, "subcategory_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_random_word_for_category"("category_id" "uuid", "is_custom" boolean, "subcategory_id" "uuid") TO "service_role";
```
