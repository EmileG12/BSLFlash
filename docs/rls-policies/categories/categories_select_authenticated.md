# categories_select_authenticated

**Table:** [categories](../../db-schema/categories.md)
**Command:** SELECT · **Role:** authenticated

**Purpose:** Any logged-in user can read all categories — this is shared reference/dictionary content, not user-owned data.

## Current definition

*From `npx supabase db dump --local --schema public`:*

```sql
CREATE POLICY "categories_select_authenticated" ON "public"."categories" FOR SELECT TO "authenticated" USING (true);
```
