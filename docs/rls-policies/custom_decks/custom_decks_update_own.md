# custom_decks_update_own

**Table:** [custom_decks](../../db-schema/custom_decks.md)
**Command:** UPDATE · **Role:** authenticated

**Purpose:** A user can only update their own custom decks, and can't reassign one to a different owner (`USING` and `WITH CHECK` both pin `user_id = auth.uid()`). This is also the policy that gates [`set_custom_deck_public`](../../rpc-functions/set_custom_deck_public.md) — that RPC runs as the caller and has no `SECURITY DEFINER`, so a non-owner's publish attempt updates zero rows. It also gates the rename in [`update_custom_deck`](../../rpc-functions/update_custom_deck.md).

## Current definition

*From `npx supabase db dump --local --schema public`:*

```sql
CREATE POLICY "custom_decks_update_own" ON "public"."custom_decks" FOR UPDATE TO "authenticated" USING (("user_id" = "auth"."uid"())) WITH CHECK (("user_id" = "auth"."uid"()));
```
