# sign_videos_select_authenticated

**Table:** [sign_videos](../../db-schema/sign_videos.md)
**Command:** SELECT · **Role:** authenticated

**Purpose:** Any logged-in user can read all sign video rows — this is shared reference/dictionary content, not user-owned data.

## Current definition

*From `npx supabase db dump --local --schema public`:*

```sql
CREATE POLICY "sign_videos_select_authenticated" ON "public"."sign_videos" FOR SELECT TO "authenticated" USING (true);
```
