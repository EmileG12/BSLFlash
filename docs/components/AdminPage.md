# AdminPage

**Path:** `src/pages/AdminPage.tsx` · **Route:** `/admin` (behind [AdminRoute](./AdminRoute.md))

**Purpose:** The admin's content tool. Two sections: an "Add a new word" form (word, definition, a first video, and categories), and a searchable list where an admin can add or remove which existing categories a word belongs to.

**Key behavior:**
- **Add a word** inserts a `words` row, then a `signs` row named `Standard` with `is_primary: true`, then uploads the video through [signVideoUpload](../utils/signVideoUpload.md) under that sign, then inserts the selected `word_categories` links. Word, definition and a video are all required before any write happens.
- **The steps are not one transaction.** Each insert is a separate client request, so a failure partway through (for example the upload) leaves the earlier rows in place. The form shows the error, and the admin has to finish or clean up by hand. This is how the page is written, not a deliberate trade-off.
- **Admin is insert-only on content.** The page never edits or deletes a word, sign or video. Its one removal is on `word_categories`, to untag a category from a word. Those permissions come from the `*_admin_or_superadmin` policies (see [words](../rls-policies/words/README.md), [word_categories](../rls-policies/word_categories/README.md)).
- **Category editing** uses a per-row expandable [TagPicker](./TagPicker.md). The first expand loads that word's current links; each toggle then inserts or deletes one `word_categories` row immediately, without a save button.
- **Word list** is the shared [`useWords`](../hooks/useWords.md) result, filtered client-side by a case-insensitive substring match on the word.

**Depends on:** [TagPicker](./TagPicker.md), [useWords](../hooks/useWords.md), [signVideoUpload](../utils/signVideoUpload.md), [TableCard](./TableCard.md), `Card`/`Input`/`Textarea`/`Table`/`Button` from `src/components/ui/`.

**Used by:** the `/admin` route in `src/App.tsx`. Linked from [NavBar](./NavBar.md) and [MobileNavSheet](./MobileNavSheet.md).
