# RPC functions

Postgres functions exposed via Supabase RPC, one doc file per function.

| Function | Signature | Purpose |
|---|---|---|
| [is_superadmin](./is_superadmin.md) | `is_superadmin() RETURNS boolean` | Checks whether the current user holds the `superadmin` role; used inside RLS policies, also directly callable. |
| [handle_new_user](./handle_new_user.md) | `handle_new_user() RETURNS trigger` | Trigger-only (not RPC-callable): auto-creates a `profiles` row + `user` role grant whenever a new `auth.users` row is inserted. |
| [get_random_word_for_category](./get_random_word_for_category.md) | `get_random_word_for_category(category_id uuid, is_custom boolean DEFAULT false, subcategory_id uuid DEFAULT NULL) RETURNS TABLE(...)` | Returns one random word (+ primary sign video) from a category or custom deck, optionally narrowed to a subcategory, for the flashcard game. |
| [get_random_words_for_category](./get_random_words_for_category.md) | `get_random_words_for_category(category_id uuid, card_count integer DEFAULT 10, is_custom boolean DEFAULT false, subcategory_id uuid DEFAULT NULL) RETURNS TABLE(...)` | Returns up to card_count distinct random words (+ primary sign videos) from a category or custom deck, optionally narrowed to a subcategory, for the "10 Cards" mode. |
| [get_available_subcategories_for_category](./get_available_subcategories_for_category.md) | `get_available_subcategories_for_category(category_id uuid) RETURNS TABLE(id uuid, category_name text)` | Returns the topic categories that share at least one word with the given category, for the subcategory chip picker. |
| [create_custom_category](./create_custom_category.md) | `create_custom_category(p_name text, p_word_ids uuid[]) RETURNS uuid` | Creates a custom deck (header row + word links) owned by the calling user, atomically. |

See the `migrations` skill for the workflow.
