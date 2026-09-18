# sign_videos_insert_superadmin

**Table:** [sign_videos](../../db-schema/sign_videos.md)
**Command:** INSERT · **Role:** authenticated

**Purpose:** Only a user holding the `superadmin` role (per [`is_superadmin()`](../../rpc-functions/is_superadmin.md)) can create new sign video rows.

## Current definition

*From `npx supabase db dump --local --schema public`:*

```sql
CREATE POLICY "sign_videos_insert_superadmin" ON "public"."sign_videos" FOR INSERT TO "authenticated" WITH CHECK ("public"."is_superadmin"());
```
