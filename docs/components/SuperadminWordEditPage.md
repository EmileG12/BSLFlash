# SuperadminWordEditPage

**Path:** `src/pages/SuperadminWordEditPage.tsx` · **Route:** `/superadmin/words/:wordId` (behind [SuperadminRoute](./SuperadminRoute.md))

**Purpose:** Edits one word and manages its sign variants and their video pools. Reached by clicking a row on [SuperadminWordsPage](./SuperadminWordsPage.md).

**Key behavior:**
- **Word text and definition** load once from `words`. Save is a single `update`. Only superadmin can update `words`.
- **Variants table** comes from [useWordVariants](../hooks/useWordVariants.md): each variant with its region and its videos. Each video is listed with its format, duration and dimensions. A variant with no videos is flagged as such.
- **Primary toggle (Star)** calls [`set_primary_sign`](../rpc-functions/set_primary_sign.md). The UI flips the primary flag optimistically across all variants of the word. If the RPC fails, it restores the previous list and shows an error. Clicking the current primary does nothing.
- **Add video** opens a Dialog for an existing variant and uploads one file via [signVideoUpload](../utils/signVideoUpload.md). The dialog says quizzing picks a random video from that variant's pool, so the video does not become a pinned take.
- **Add variant** opens a Dialog for a new variant (name, optional region, and a file). The first video is required in the same action. The variant row is inserted, then the video is uploaded to it, and the new variant is appended to the list only once both have succeeded. If the upload fails, the bare variant row is already in the database and is not removed.

**Depends on:** [useWordVariants](../hooks/useWordVariants.md), [signVideoUpload](../utils/signVideoUpload.md), [supabase-client](../utils/supabase-client.md), the [`set_primary_sign`](../rpc-functions/set_primary_sign.md) RPC, `Dialog`/`Table`/`Input`/`Button` from `src/components/ui/`.

**Used by:** the `/superadmin/words/:wordId` route in `src/App.tsx`, reached from [SuperadminWordsPage](./SuperadminWordsPage.md).
