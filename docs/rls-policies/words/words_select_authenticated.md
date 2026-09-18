# words_select_authenticated

**Table:** [words](../../db-schema/words.md)
**Command:** SELECT · **Role:** authenticated

**Purpose:** Any logged-in user can read all words — this is shared reference/dictionary content, not user-owned data.

## Current definition

*From `npx supabase db dump --local --schema public`:*

```sql
CREATE POLICY "words_select_authenticated" ON "public"."words" FOR SELECT TO "authenticated" USING (true);
```
