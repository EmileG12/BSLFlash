# categories

**Schema:** `public`
**Last touched by migration:** [`20260919114641_add_is_vocabulary_to_categories.sql`](../../supabase/migrations/20260919114641_add_is_vocabulary_to_categories.sql)

**Purpose:** Vocabulary categories/topics for the flashcard feature (e.g. Animals, Greetings, Colours, Time). Linked to [`words`](./words.md) via the [`word_categories`](./word_categories.md) many-to-many join table.

`is_vocabulary` distinguishes two independent kinds of grouping over the same `words`: topic categories (Animals, Greetings, Colours, Time — `is_vocabulary = false`) versus educational vocabulary-requirement categories (e.g. GCSE required vocabulary — `is_vocabulary = true`). A word can belong to both a topic category and a vocabulary category simultaneously via separate `word_categories` rows (e.g. "Monday" belongs to both `Time` and `GCSE`). [SelectDeckCard](../components/SelectDeckCard.md) uses this flag to show two separate deck pickers on the home page.

That same dual-membership shape is also what lets a vocabulary category be narrowed to one topic category at play time, with no schema change: [`get_available_subcategories_for_category`](../rpc-functions/get_available_subcategories_for_category.md) finds which topic categories (`is_vocabulary = false`) overlap a given vocabulary category via a self-join on `word_categories`, and [`get_random_word_for_category`](../rpc-functions/get_random_word_for_category.md)/[`get_random_words_for_category`](../rpc-functions/get_random_words_for_category.md) apply the chosen subcategory as a second `word_categories` membership check, intersected with the usual category-membership predicate. [SubCategoryChips](../components/SubCategoryChips.md), rendered by [ModeSelectPage](../components/ModeSelectPage.md) only when `isVocabulary` is `true`, is the UI for this.

## Columns

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | `uuid` | No | `gen_random_uuid()` | Primary key. |
| `category_name` | `text` | No | — | Unique, case-sensitive category name. |
| `is_vocabulary` | `boolean` | No | `false` | `true` for educational vocabulary-requirement categories (e.g. GCSE); `false` for ordinary topic categories. |

## Constraints & indexes

- `PRIMARY KEY (id)`
- `UNIQUE (category_name)`

## Row Level Security

RLS is enabled. See [rls-policies/categories/](../rls-policies/categories/README.md): any authenticated user can read all rows; only `superadmin` can insert/update/delete.

## Current DDL

*From `npx supabase db dump --local --schema public`:*

```sql
CREATE TABLE IF NOT EXISTS "public"."categories" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "category_name" "text" NOT NULL,
    "is_vocabulary" boolean DEFAULT false NOT NULL
);

COMMENT ON TABLE "public"."categories" IS 'Vocabulary categories/topics (e.g. Animals, Greetings, BSL Level 1 Vocabulary).';

ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_category_name_key" UNIQUE ("category_name");

ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_pkey" PRIMARY KEY ("id");

ALTER TABLE "public"."categories" ENABLE ROW LEVEL SECURITY;
```
