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

**Key behavior:** The parent owns `selectedIds`; WordPicker owns the search text and which word's definition popover is open (`openWordId`), both internal state. `availableWords` is every word whose id is not in `selectedIds`, filtered by a case-insensitive substring match on the search text. `selectedWords` maps `selectedIds` back to words through a `Map` built from `words`, and drops any id that is not in `words`. A word therefore never appears in both columns at once, because the parent moves its id between the two lists.

Each word in both columns has an info-icon trigger that opens a `Popover` ([src/components/ui/popover.tsx](../../src/components/ui/popover.tsx)) showing `word.definition`. `openWordId` is a single piece of state shared by every row in both columns, so only one definition popover can be open at a time — opening a different one closes whichever was open, in one click. Because a catalog row's add-button can no longer also host the info trigger (a `<button>` can't nest another interactive `<button>`), each catalog row is a `<div>` wrapping two sibling `Button`s: the add target (`Plus` icon + word text, `flex-1`) and the info trigger, mirroring the cart row's existing word-text + remove-button two-target layout.

The two columns are `role="group"` regions labelled "Word catalog" and "Selected words", so assistive tech can announce each as a labelled region. Catalog add-buttons are `min-h-11`. The remove control and both info triggers are `size-11` because their `icon-sm` size is 28px square by default, below the 44×44 touch-target minimum.

The definition popover's content has a `word-definition-popover` class paired with a scoped rule in `src/index.css` (`[data-radix-popper-content-wrapper]:has(> .word-definition-popover) { pointer-events: none; }`), plus `pointer-events-none` directly on the content element. Both columns' rows are packed tightly (`gap-1`, `min-h-11` each), so an open popover's floating layer can sit directly on top of the very next row — Radix's own collision avoidance only reacts to viewport/boundary edges, not sibling DOM elements, so it doesn't prevent this overlap on its own. Making the popover's hit-test area (including Radix Popper's wrapper div, not just the content node) pass clicks through lets a click on a covered trigger reach that trigger instead of being swallowed by the popover above it. The `:has()` scoping keeps this opt-in to this one popover instance; other `Popover`/`DropdownMenu`/`Select`/`Combobox` consumers sharing the same wrapper attribute are unaffected. The tradeoff: text inside the popover can't be selected/copied by dragging, acceptable since it's a short, read-only definition.

Layout: each column is `flex max-h-[40vh] min-h-0 flex-col md:max-h-none`, and each scrollable list is `flex-1 min-h-0 overflow-y-auto`. The `max-h-[40vh]` cap applies only on mobile, where the parent card grows with its content. From `md` up the parent gives the columns a fixed height and the lists scroll inside it. `min-h-0` is required at every level of this chain: flex and grid items default to `min-height: auto`, which stops a fixed-height ancestor from shrinking the item below its content size. The left column uses `bg-card`. The right column is `bg-brand-muted` and is divided from the left by `border-t border-brand md:border-l`, so the divider is horizontal on mobile, where the columns stack.

**Depends on:** [useWords](../hooks/useWords.md) (for the `WordOption` type only), `Button`/`Input`/`Popover` from `src/components/ui/`, `lucide-react` (`Info`, `Plus`, `X`), the global `pointer-events` rule in `src/index.css`.

**Used by:** [CreateDeckPage](./CreateDeckPage.md), [EditDeckModal](./EditDeckModal.md).

**Tested by:** [WordPicker.test.tsx](../tests/WordPicker.md) (unit) and [WordPicker.browser.test.tsx](../tests/WordPicker.browser.md) (browser). Its behaviour is also exercised indirectly through [CreateDeckPage](../tests/CreateDeckPage.md) and [EditDeckModal](../tests/EditDeckModal.md).
