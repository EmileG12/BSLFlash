# custom_categories_insert_own

**Table:** [custom_categories](../../db-schema/custom_categories.md)
**Command:** INSERT · **Role:** authenticated

**Purpose:** A user can only insert a custom deck owned by themselves (`user_id = auth.uid()`), matching the column's own default — the check holds even if a client tried to pass a different `user_id` explicitly.

## Current definition

*From `npx supabase db dump --local --schema public`:*

```sql
CREATE POLICY "custom_categories_insert_own" ON "public"."custom_categories" FOR INSERT TO "authenticated" WITH CHECK (("user_id" = "auth"."uid"()));
```
