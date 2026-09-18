# word_categories_select_authenticated

**Table:** [word_categories](../../db-schema/word_categories.md)
**Command:** SELECT · **Role:** authenticated

**Purpose:** Any logged-in user can read all word-category associations — this is shared reference/dictionary content, not user-owned data.

## Current definition

*From `npx supabase db dump --local --schema public`:*

```sql
CREATE POLICY "word_categories_select_authenticated" ON "public"."word_categories" FOR SELECT TO "authenticated" USING (true);
```
