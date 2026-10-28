# AdminPage

**Path:** `src/pages/AdminPage.tsx` · **Route:** `/admin` (behind [AdminRoute](./AdminRoute.md))

**Purpose:** The admin's content tool. Two sections: an "Add a new word" form (word, definition, a first video, and categories), and a searchable list where an admin can add or remove which existing categories a word belongs to.

**Key behavior:**
- **Add a word** generates the sign's id, uploads the video through [signVideoUpload](../utils/signVideoUpload.md) under that id, then calls [`add_word_with_video`](../rpc-functions/add_word_with_video.md). That one call writes the `words` row, the `Standard` `signs` row with `is_primary: true`, the `sign_videos` row, and the selected `word_categories` links, in a single transaction. Word, definition and a video are all required before any work starts.
- **Upload first, so the database write is all or nothing.** Storage is not part of the Postgres transaction. When the rows were inserted one request at a time, a failed upload left the word and sign committed with no video. Now a failed upload writes nothing, and a failed RPC rolls back every row it inserted. The page then deletes the uploaded file.
- **Step-specific errors.** An upload failure shows `Video upload failed: <reason>. No changes were saved.` A failed RPC shows `Failed to add word: <reason>. No changes were saved.` when the uploaded file was removed. If that removal also fails, the message says the file may need manual cleanup and gives its storage path. The admin needs to tell which case occurred, and whether a file was left behind.
- **Sign id is generated here, not by the database.** The storage path is `<sign_id>/<file>`, so the id must exist before the upload. The same id is passed to the RPC so the `signs` row is inserted with it.
- **Admin is insert-only on content.** The page never edits or deletes a word, sign or video. Its one removal is on `word_categories`, to untag a category from a word. Those permissions come from the `*_admin_or_superadmin` policies (see [words](../rls-policies/words/README.md), [word_categories](../rls-policies/word_categories/README.md)).
- **Category editing** uses a per-row expandable [TagPicker](./TagPicker.md). The first expand loads that word's current links; each toggle then inserts or deletes one `word_categories` row immediately, without a save button.
- **Word list** is the shared [`useWords`](../hooks/useWords.md) result, filtered client-side by a case-insensitive substring match on the word. The search `Input` carries an explicit `bg-card dark:bg-card` so it reads as a solid control against the toolbar's gradient background — see [TableCard](./TableCard.md).
- **Adding a word refetches that list.** The add-word form calls `supabase.rpc` directly rather than through a `useMutation`, so on success it explicitly invalidates `useWords`' `['words']` query key — without that, React Query has no way to know the table it's rendering just went stale, and the new word wouldn't appear until the next full page load.

**Depends on:** [TagPicker](./TagPicker.md), [useWords](../hooks/useWords.md), [signVideoUpload](../utils/signVideoUpload.md), [`add_word_with_video`](../rpc-functions/add_word_with_video.md), [TableCard](./TableCard.md), `Card`/`Input`/`Textarea`/`Table`/`Button` from `src/components/ui/`.

**Used by:** the `/admin` route in `src/App.tsx`. Linked from [NavBar](./NavBar.md) and [MobileNavSheet](./MobileNavSheet.md).
