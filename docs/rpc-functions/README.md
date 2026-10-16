# RPC functions

Postgres functions exposed via Supabase RPC, one doc file per function.

| Function | Signature | Purpose |
|---|---|---|
| [is_superadmin](./is_superadmin.md) | `is_superadmin() RETURNS boolean` | Checks whether the current user holds the `superadmin` role; used inside RLS policies, also directly callable. |
| [is_admin](./is_admin.md) | `is_admin() RETURNS boolean` | Checks whether the current user holds the `admin` role. Does not imply superadmin; policies check `is_superadmin() OR is_admin()`. |
| [list_users_with_roles](./list_users_with_roles.md) | `list_users_with_roles() RETURNS TABLE(user_id, email, user_name, banned_until, roles text[])` | Superadmin-only: every account with its email, display name, ban status and role names. Backs the Roles and Accounts pages. |
| [assign_role](./assign_role.md) | `assign_role(p_user_id uuid, p_role_name text) RETURNS void` | Superadmin-only: grants `admin` or `superadmin` to a user. Idempotent. |
| [revoke_role](./revoke_role.md) | `revoke_role(p_user_id uuid, p_role_name text) RETURNS void` | Superadmin-only: removes `admin` or `superadmin`. Refuses to remove the last active superadmin. |
| [ban_user](./ban_user.md) | `ban_user(p_user_id uuid) RETURNS void` | Superadmin-only: indefinitely bans an account via `auth.users.banned_until`. Refuses to ban the last active superadmin. |
| [unban_user](./unban_user.md) | `unban_user(p_user_id uuid) RETURNS void` | Superadmin-only: clears a ban. |
| [delete_user](./delete_user.md) | `delete_user(p_user_id uuid) RETURNS void` | Superadmin-only: permanently deletes an account (`auth.users` row), cascading to its profile, roles, decks, saves and likes. Refuses to delete the last active superadmin. Irreversible. |
| [set_primary_sign](./set_primary_sign.md) | `set_primary_sign(p_sign_id uuid) RETURNS void` | Superadmin-only: atomically makes one sign the primary variant of its word. |
| [handle_new_user](./handle_new_user.md) | `handle_new_user() RETURNS trigger` | Trigger-only (not RPC-callable): auto-creates a `profiles` row + `user` role grant whenever a new `auth.users` row is inserted. |
| [get_random_word_for_category](./get_random_word_for_category.md) | `get_random_word_for_category(category_id uuid, is_custom boolean DEFAULT false, subcategory_id uuid DEFAULT NULL) RETURNS TABLE(...)` | Returns one random word (+ primary sign video) from a category or custom deck, optionally narrowed to a subcategory, for the flashcard game. |
| [get_random_words_for_category](./get_random_words_for_category.md) | `get_random_words_for_category(category_id uuid, card_count integer DEFAULT 10, is_custom boolean DEFAULT false, subcategory_id uuid DEFAULT NULL) RETURNS TABLE(...)` | Returns up to card_count distinct random words (+ primary sign videos) from a category or custom deck, optionally narrowed to a subcategory, for the "10 Cards" mode. |
| [get_available_subcategories_for_category](./get_available_subcategories_for_category.md) | `get_available_subcategories_for_category(category_id uuid) RETURNS TABLE(id uuid, category_name text)` | Returns the topic categories that share at least one word with the given category, for the subcategory chip picker. |
| [get_categories_with_words](./get_categories_with_words.md) | `get_categories_with_words(p_is_vocabulary boolean) RETURNS TABLE(id uuid, category_name text, is_vocabulary boolean)` | Returns categories of the given kind that have at least one word, for the standard deck-selection menus. Excludes tag-only categories. |
| [get_available_deck_tags](./get_available_deck_tags.md) | `get_available_deck_tags() RETURNS TABLE(id uuid, category_name text)` | Returns the tag categories currently used by at least one published deck, for the Browse directory's tag filter. |
| [get_public_decks](./get_public_decks.md) | `get_public_decks(p_search text DEFAULT NULL, p_tag_ids uuid[] DEFAULT NULL, p_sort text DEFAULT 'likes') RETURNS TABLE(...)` | Lists published custom decks with owner, tags, like count, and the caller's like/save state, filtered by name and tags (AND), sorted by likes, newest or name. |
| [get_saved_decks](./get_saved_decks.md) | `get_saved_decks() RETURNS TABLE(id uuid, deck_name text, owner_user_id uuid, owner_name text)` | Lists the caller's saved decks joined to their current `custom_decks` row; a deck the owner has unpublished is omitted, and reappears on republish. |
| [create_custom_deck](./create_custom_deck.md) | `create_custom_deck(p_name text, p_word_ids uuid[]) RETURNS uuid` | Creates a custom deck (header row + word links) owned by the calling user, atomically. |
| [update_custom_deck](./update_custom_deck.md) | `update_custom_deck(p_deck_id uuid, p_name text, p_word_ids uuid[], p_is_public boolean) RETURNS void` | Renames a custom deck, replaces its word list, and sets its publish flag in one transaction. Refuses an empty word list. Owner-only via RLS. |
| [keepalive_ping](./keepalive_ping.md) | `keepalive_ping() RETURNS timestamptz` | Anonymous-callable: a trivial system-catalog read used by a scheduled GitHub Actions workflow to prevent free-tier project auto-pause. Not used by the frontend. |

See the `migrations` skill for the workflow.
