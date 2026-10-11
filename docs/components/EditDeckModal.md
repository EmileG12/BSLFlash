# EditDeckModal

**Path:** `src/components/EditDeckModal.tsx`

**Purpose:** The owner-only edit dialog for a custom deck. It renames the deck, adds and removes words, changes its tags, and toggles its publish state. Opened from the "Edit" button on each owned deck in [MyDecksPage](../components/MyDecksPage.md). Saved decks have no edit action, because only the owner can edit a deck.

**Props:**
| Prop | Type | Description |
|---|---|---|
| `deckId` | `string` | The deck to edit. |
| `onClose` | `() => void` | Called on Cancel, on dismissing the dialog, and after a successful Save. |
| `onSaved` | `(deckId: string, deckName: string) => void` | Called after a successful Save with the trimmed name, so the caller can update its own list without refetching. |

**Structure:** Two components in one file. The exported `EditDeckModal` loads the deck with [useCustomDeckDetail](../hooks/useCustomDeckDetail.md) and renders the `Dialog` shell, showing "Loading deck..." or "Failed to load deck: …" in place of the form. Once `detail` resolves, it mounts a non-exported `EditDeckForm`, which receives `detail` as a prop. `EditDeckForm` seeds its editable state (name, selected word ids, selected tag ids, publish flag) with lazy `useState` initializers from that prop. It does not sync fetched data into state with an effect. That pattern trips the repo's `react-hooks/set-state-in-effect` lint rule. Mounting the form only after the data is ready avoids it.

**Key behavior:**

- **Publish toggle.** The Published/Unpublished button calls [`set_custom_deck_public`](../rpc-functions/set_custom_deck_public.md) immediately on click. It is not part of Save. The button is disabled while the call is in flight. The displayed state changes only after the call succeeds, and a failure shows its message under the toggle.
- **Save.** Enabled only when the trimmed name is non-empty, at least one word is selected, and no save is in flight. Save runs these steps in order:
  1. [`update_custom_deck`](../rpc-functions/update_custom_deck.md) with the trimmed name and the full selected word list. This is a full replace.
  2. If any tag was removed from the original `detail.tagIds`, a `custom_deck_tags` delete for those category ids.
  3. If any tag was added, a `custom_deck_tags` insert for those category ids.

  Steps 2 and 3 are skipped when their list is empty. Tags are written with direct table calls, not an RPC, and rely on the owner-gated [`custom_deck_tags_delete_own`](../rls-policies/custom_deck_tags/custom_deck_tags_delete_own.md) and [`custom_deck_tags_insert_own`](../rls-policies/custom_deck_tags/custom_deck_tags_insert_own.md) policies. On success it calls `onSaved(deckId, trimmedName)`, then `onClose()`.
- **Diff baseline.** The tag diff compares against `detail.tagIds` as loaded when the modal opened. The modal does not refetch between attempts, so a retried Save recomputes the diff against that same baseline.
- **Partial failure.** Steps 1, 2, and 3 are separate requests, not one transaction. If step 1 succeeds and a later step fails, the rename and word list are already saved, the modal stays open with the error, and `onSaved` is not called. The caller's list therefore keeps the old name until it refetches.
- **Word list.** [WordPicker](./WordPicker.md) is fed by [useWords](../hooks/useWords.md), which is fetched inside `EditDeckForm`, so the word catalog loads after the deck detail has loaded.
- **Tags.** [TagPicker](./TagPicker.md) toggles ids in `selectedTagIds`.

**Depends on:** [useCustomDeckDetail](../hooks/useCustomDeckDetail.md), [useWords](../hooks/useWords.md), [WordPicker](./WordPicker.md), [TagPicker](./TagPicker.md), [`set_custom_deck_public`](../rpc-functions/set_custom_deck_public.md), [`update_custom_deck`](../rpc-functions/update_custom_deck.md), the [`custom_deck_tags`](../db-schema/custom_deck_tags.md) table, `Dialog`/`Button`/`Input` from `src/components/ui/`, the `supabase` client.

**Used by:** [MyDecksPage](./MyDecksPage.md).

**Tested by:** [docs/tests/EditDeckModal.md](../tests/EditDeckModal.md).
