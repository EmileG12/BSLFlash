# signs_select_authenticated

**Table:** [signs](../../db-schema/signs.md)
**Command:** SELECT · **Role:** authenticated

**Purpose:** Any logged-in user can read all sign variants — this is shared reference/dictionary content, not user-owned data.

## Current definition

*From `npx supabase db dump --local --schema public`:*

```sql
CREATE POLICY "signs_select_authenticated" ON "public"."signs" FOR SELECT TO "authenticated" USING (true);
```
