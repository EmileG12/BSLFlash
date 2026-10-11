# WordPicker

**Path:** `src/components/WordPicker.tsx`

**Purpose:** The two-column word picker: a searchable catalog of available words on the left, and the selected words on the right, each word moved between the two lists with a button. Extracted from the inline markup in [CreateDeckPage](../components/CreateDeckPage.md) so that [EditDeckModal](./EditDeckModal.md) renders the same picker without a second copy.

**Props:**
| Prop | Type | Description |
|---|---|---|
| `words` | `WordOption[]` | The full word list, from [useWords](../hooks/useWords.md). |
| `loading` | `boolean` | Shows a loading message in the catalog column. |
| `error` | `string \| null` | Shows an error message in the catalog column. |
| `selectedIds` | `string[]` | Ids of the words currently selected. Owned by the parent. |
| `onAdd` | `(id: string) => void` | Called with a catalog word's id when its button is clicked. |
| `onRemove` | `(id: string) => void` | Called with a selected word's id when its remove button is clicked. |

**Key behavior:** The parent owns `selectedIds`; WordPicker owns only the search text, which is internal state. `availableWords` is every word whose id is not in `selectedIds`, filtered by a case-insensitive substring match on the search text. `selectedWords` maps `selectedIds` back to words through a `Map` built from `words`, and drops any id that is not in `words`. A word therefore never appears in both columns at once, because the parent moves its id between the two lists.

The two columns are `role="group"` regions labelled "Word catalog" and "Selected words", so assistive tech can announce each as a labelled region. Catalog entries are `min-h-11` buttons. The remove control is `size-11` because its `icon-sm` size is 28px square by default, below the 44×44 touch-target minimum.

Layout: each column is `flex max-h-[40vh] min-h-0 flex-col md:max-h-none`, and each scrollable list is `flex-1 min-h-0 overflow-y-auto`. The `max-h-[40vh]` cap applies only on mobile, where the parent card grows with its content. From `md` up the parent gives the columns a fixed height and the lists scroll inside it. `min-h-0` is required at every level of this chain: flex and grid items default to `min-height: auto`, which stops a fixed-height ancestor from shrinking the item below its content size. The left column uses `bg-card`. The right column is `bg-brand-muted` and is divided from the left by `border-t border-brand md:border-l`, so the divider is horizontal on mobile, where the columns stack.

**Depends on:** [useWords](../hooks/useWords.md) (for the `WordOption` type only), `Button`/`Input` from `src/components/ui/`, `lucide-react` (`Plus`, `X`).

**Used by:** [CreateDeckPage](./CreateDeckPage.md), [EditDeckModal](./EditDeckModal.md).

**Tested by:** No dedicated test file. Its behaviour is exercised through [CreateDeckPage](../tests/CreateDeckPage.md) and [EditDeckModal](../tests/EditDeckModal.md).
