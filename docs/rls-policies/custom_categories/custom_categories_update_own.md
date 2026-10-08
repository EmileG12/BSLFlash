# custom_categories_update_own

**Table:** [custom_categories](../../db-schema/custom_categories.md)
**Command:** UPDATE · **Role:** authenticated

**Purpose:** A user can only update their own custom decks, and can't reassign one to a different owner (`USING` and `WITH CHECK` both pin `user_id = auth.uid()`).

## Current definition

*From `npx supabase db dump --local --schema public`:*

```sql
CREATE POLICY "custom_categories_update_own" ON "public"."custom_categories" FOR UPDATE TO "authenticated" USING (("user_id" = "auth"."uid"())) WITH CHECK (("user_id" = "auth"."uid"()));
```
