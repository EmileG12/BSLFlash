# sign_videos_delete_superadmin

**Table:** [sign_videos](../../db-schema/sign_videos.md)
**Command:** DELETE · **Role:** authenticated

**Purpose:** Only a user holding the `superadmin` role (per [`is_superadmin()`](../../rpc-functions/is_superadmin.md)) can delete sign video rows.

## Current definition

*From `npx supabase db dump --local --schema public`:*

```sql
CREATE POLICY "sign_videos_delete_superadmin" ON "public"."sign_videos" FOR DELETE TO "authenticated" USING ("public"."is_superadmin"());
```
