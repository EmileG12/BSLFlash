# custom_decks_select_own

**Table:** [custom_decks](../../db-schema/custom_decks.md)
**Command:** SELECT · **Role:** authenticated

**Purpose:** A user can read their own custom decks regardless of `is_public`. Permissive policies combine with OR, so this is one half of the read rule: the other half is [`custom_decks_select_public`](./custom_decks_select_public.md).

## Current definition

*From `npx supabase db dump --local --schema public`:*

```sql
CREATE POLICY "custom_decks_select_own" ON "public"."custom_decks" FOR SELECT TO "authenticated" USING (("user_id" = "auth"."uid"()));
```
