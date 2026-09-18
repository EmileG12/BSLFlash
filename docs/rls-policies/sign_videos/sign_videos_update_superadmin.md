# sign_videos_update_superadmin

**Table:** [sign_videos](../../db-schema/sign_videos.md)
**Command:** UPDATE · **Role:** authenticated

**Purpose:** Only a user holding the `superadmin` role (per [`is_superadmin()`](../../rpc-functions/is_superadmin.md)) can update existing sign video rows.

## Current definition

*From `npx supabase db dump --local --schema public`:*

```sql
CREATE POLICY "sign_videos_update_superadmin" ON "public"."sign_videos" FOR UPDATE TO "authenticated" USING ("public"."is_superadmin"()) WITH CHECK ("public"."is_superadmin"());
```
