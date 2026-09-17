-- Enforce unique usernames on public.profiles, required to detect
-- "username already in use" during signup (handled by the trigger added in
-- the next migration). Case-sensitive per product decision.
--
-- user_name stays NULLABLE: a profile can exist without a name via paths
-- that don't go through the signup trigger (e.g. a user created directly in
-- Studio with no raw_user_meta_data). Multiple NULLs are fine under a unique
-- constraint -- NULL is never considered equal to another NULL.
alter table public.profiles add constraint profiles_user_name_key unique (user_name);
