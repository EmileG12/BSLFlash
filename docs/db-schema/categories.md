# categories

**Schema:** `public`
**Last touched by migration:** [`20261011193851_add_is_active_to_categories.sql`](../../supabase/migrations/20261011193851_add_is_active_to_categories.sql)

**Purpose:** Vocabulary categories/topics for the flashcard feature (e.g. Animals, Greetings, Colours, Time). Linked to [`words`](./words.md) via the [`word_categories`](./word_categories.md) many-to-many join table.

`is_vocabulary` distinguishes two independent kinds of grouping over the same `words`: topic categories (Animals, Greetings, Colours, Time — `is_vocabulary = false`) versus educational vocabulary-requirement categories (e.g. GCSE required vocabulary — `is_vocabulary = true`). A word can belong to both a topic category and a vocabulary category simultaneously via separate `word_categories` rows (e.g. "Monday" belongs to both `Time` and `GCSE`). [SelectDeckCard](../components/SelectDeckCard.md) uses this flag to show two separate deck pickers on the home page.

That same dual-membership shape is also what lets a vocabulary category be narrowed to one topic category at play time, with no schema change: [`get_available_subcategories_for_category`](../rpc-functions/get_available_subcategories_for_category.md) finds which topic categories (`is_vocabulary = false`) overlap a given vocabulary category via a self-join on `word_categories`, and [`get_random_word_for_category`](../rpc-functions/get_random_word_for_category.md)/[`get_random_words_for_category`](../rpc-functions/get_random_words_for_category.md) apply the chosen subcategory as a second `word_categories` membership check, intersected with the usual category-membership predicate. [SubCategoryChips](../components/SubCategoryChips.md), rendered by [ModeSelectPage](../components/ModeSelectPage.md) only when `isVocabulary` is `true`, is the UI for this.

A `categories` row can also exist purely as a tag for public custom decks, via [`custom_deck_tags`](./custom_deck_tags.md), with zero `word_categories` links. The standard deck-selection menus therefore read through [`get_categories_with_words`](../rpc-functions/get_categories_with_words.md), which only returns rows that have at least one word. The public directory's tag filter reads [`get_available_deck_tags`](../rpc-functions/get_available_deck_tags.md) instead.

## Columns

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | `uuid` | No | `gen_random_uuid()` | Primary key. |
| `category_name` | `text` | No | — | Unique, case-sensitive category name. |
| `is_vocabulary` | `boolean` | No | `false` | `true` for educational vocabulary-requirement categories (e.g. GCSE); `false` for ordinary topic categories. |
| `is_active` | `boolean` | No | `true` | Soft-disable flag, toggled by superadmin on the Categories page. Stored only: no browsing query or RPC reads it yet (see below). Existing rows default to `true`. |

## Constraints & indexes

- `PRIMARY KEY (id)`
- `UNIQUE (category_name)`

## Row Level Security

RLS is enabled. See [rls-policies/categories/](../rls-policies/categories/README.md): any authenticated user can read all rows; only `superadmin` can insert/update/delete. Admins have no write access to `categories` — they can only tag words into existing categories via [`word_categories`](./word_categories.md).

`is_active` is intended to hide a category from browsing without deleting it or its `word_categories` links, and to leave the words themselves visible. No reader currently applies that filter: [`useCategories`](../hooks/useCategories.md), [`useAllCategories`](../hooks/useAllCategories.md), [`get_categories_with_words`](../rpc-functions/get_categories_with_words.md) and the random-word RPCs do not reference the column. The superadmin Categories page reads every row, disabled ones included, via [`useManagedCategories`](../hooks/useManagedCategories.md).

## Current DDL

*From `npx supabase db dump --local --schema public`:*

```sql
CREATE TABLE IF NOT EXISTS "public"."categories" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "category_name" "text" NOT NULL,
    "is_vocabulary" boolean DEFAULT false NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL
);

COMMENT ON TABLE "public"."categories" IS 'Vocabulary categories/topics (e.g. Animals, Greetings, BSL Level 1 Vocabulary).';

COMMENT ON COLUMN "public"."categories"."is_active" IS 'False hides the category from browsing (superadmin-only toggle, reversible). Words tagged only to a disabled category are not hidden themselves.';

ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_category_name_key" UNIQUE ("category_name");

ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_pkey" PRIMARY KEY ("id");

ALTER TABLE "public"."categories" ENABLE ROW LEVEL SECURITY;
```
