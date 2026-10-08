# custom_categories_delete_own

**Table:** [custom_categories](../../db-schema/custom_categories.md)
**Command:** DELETE · **Role:** authenticated

**Purpose:** A user can only delete their own custom decks. Backs [MyDecksPage](../../components/MyDecksPage.md)'s delete action (`supabase.from('custom_categories').delete().eq('id', ...)`) — deleting the header row cascades to its [`custom_category_words`](../../db-schema/custom_category_words.md) rows via that table's `ON DELETE CASCADE`.

## Current definition

*From `npx supabase db dump --local --schema public`:*

```sql
CREATE POLICY "custom_categories_delete_own" ON "public"."custom_categories" FOR DELETE TO "authenticated" USING (("user_id" = "auth"."uid"()));
```
