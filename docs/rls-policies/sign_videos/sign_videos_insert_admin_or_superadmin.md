# sign_videos_insert_admin_or_superadmin

**Table:** [sign_videos](../../db-schema/sign_videos.md)
**Command:** INSERT · **Role:** authenticated

**Purpose:** A user holding the `admin` or the `superadmin` role can create a sign video row. Checked as `is_superadmin() OR is_admin()` — see [`is_admin()`](../../rpc-functions/is_admin.md). The matching Storage upload permission is [`sign_videos_bucket_insert_admin_or_superadmin`](../../storage/sign-videos.md).

## Current definition

*Derived from the migrations (`20261011193831_allow_admin_insert_on_word_content_tables.sql`); to be confirmed against `npx supabase db dump --local --schema public`:*

```sql
CREATE POLICY "sign_videos_insert_admin_or_superadmin" ON "public"."sign_videos" FOR INSERT TO "authenticated" WITH CHECK (("public"."is_superadmin"() OR "public"."is_admin"()));
```
