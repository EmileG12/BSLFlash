# TagChipList

**Path:** `src/components/TagChipList.tsx`

**Purpose:** The presentational multi-select tag chip row: a heading, one toggle chip per tag, a loading skeleton, and an error note. Extracted so [TagFilterChips](./TagFilterChips.md) (the Browse directory filter) and [TagPicker](./TagPicker.md) (the Edit deck modal) can share the markup and styling without duplicating it. The two callers differ only in where their tags come from, so that is all they supply.

**Props:**
| Prop | Type | Description |
|---|---|---|
| `heading` | `string` | Visible heading above the chips. |
| `headingId` | `string` | Id on the heading. The chip group is labelled by it via `aria-labelledby`. Each caller passes its own id. |
| `tags` | `{ id: string; category_name: string }[]` | Tags to offer. |
| `loading` | `boolean` | Shows the skeleton in place of the chips. |
| `error` | `string \| null` | Shows the error note under the chips. |
| `selectedIds` | `string[]` | Ids of the tags currently active. A chip is `aria-pressed` when its id is in this list. |
| `onToggle` | `(id: string) => void` | Called with the clicked tag's id. The parent adds or removes it. |
| `emptyMessage` | `string` (optional) | Shown as a paragraph when there are no tags and nothing is loading or erroring. When omitted, the component renders nothing in that case. |
| `errorMessage` | `string` (optional) | Text shown under the chip group on a fetch error. Defaults to `"Tags unavailable"`. A caller with a more specific fallback story overrides it -- [TagFilterChips](./TagFilterChips.md) passes `"Tags unavailable — showing all decks"`, since the directory falls back to showing every deck when its tag list fails to load. |

**Key behavior:** Each chip is a `<button aria-pressed>`, not a checkbox. The chips are wrapped in a `role="group"` labelled by the heading. The chip classes come from [chipStyles](../utils/chipStyles.md).

Empty state: with no tags, no error, and not loading, the component returns `emptyMessage` as a paragraph, or `null` when no `emptyMessage` is given. The directory filter passes no `emptyMessage`, so its filter row disappears entirely when no published deck has a tag.

Loading state: four skeleton pills (`aria-hidden`) and a `sr-only` "Loading tags…" announcement render in place of the chips.

Error state: the heading still renders, and a muted note appears below the chip group using `errorMessage` (default `"Tags unavailable"`). The underlying error message itself is not shown.

**Depends on:** [chipStyles](../utils/chipStyles.md), `cn` from `@/lib/utils`.

**Used by:** [TagFilterChips](./TagFilterChips.md), [TagPicker](./TagPicker.md).

**Tested by:** [docs/tests/TagChipList.md](../tests/TagChipList.md).
