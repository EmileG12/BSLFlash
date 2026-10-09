# CreateDeckPage

**Path:** `src/pages/CreateDeckPage.tsx`
**Route:** `/create-decks` (authenticated, inside [AppLayout](./AppLayout.md))

**Purpose:** Lets a user build a custom deck from the full word list — a two-column "shopping cart" picker (available words on the left, selected words on the right) followed by a naming step, ending with a call to [`create_custom_category`](../rpc-functions/create_custom_category.md). Reached via the "Create Decks" link in [NavBar](./NavBar.md).

**Props:** None — all state is local to the page.

**Layout:** The `Card` is `h-auto` on mobile and `md:h-[75vh]` from `md` up — only from `md` up does the card hold a fixed overall height regardless of word count; below that it grows with content. Each column (`role="group"`) is `max-h-[40vh] min-h-0 flex flex-col md:max-h-none` — the `max-h-[40vh]` cap applies only while the card itself is free to grow (mobile), and is lifted at `md` where `CardContent` is `flex-1 min-h-0` and fills exactly the space left after the header/footer's own heights instead. Each scrollable word list is `flex-1 min-h-0 overflow-y-auto` instead of a fixed `max-h-*` — it's the lists that scroll to absorb any amount of content, not the card that grows or shrinks (at `md`). `min-h-0` is necessary at every level of this chain: flex/grid items default to `min-height: auto` (sized to their content), which silently defeats a fixed-height ancestor by refusing to shrink below content size.

`CardHeader`, `CardContent`, and `CardFooter` each carry `-mt-(--card-spacing)`, one per component, to cancel one instance of `Card`'s own `gap-(--card-spacing)`/top `py` between its children — without it, the header's `bg-muted` fill, the vertical `border-brand` column divider, and the footer's `bg-brand-muted` tray would each stop short of the next section by a visible gap instead of reading as continuous.

**Key behavior:** Fetches the full word list via [useWords](../hooks/useWords.md). `selectedIds: string[]` tracks which word ids have been added; `availableWords` is every word not already selected, filtered by a case-insensitive substring match against a `search` input. Clicking a word in the left column moves its id into `selectedIds` (`handleAdd`); clicking the `X` next to a word in the right column removes it (`handleRemove`) — words move between the two lists rather than being independently toggled, so a word can never appear in both at once. The two columns are `role="group"` with `aria-label="Word catalog"`/`aria-label="Selected words"`, so assistive tech can announce each as a labelled region.

The running total renders as a single `role="status" aria-live="polite" aria-atomic="true"` span in the footer ("`{n} word(s) selected`") rather than a live region per row, so a selection change produces one atomic announcement instead of one per list item.

The card header (title + a one-line usage description) uses `border-b border-brand bg-muted`. The left/available column uses plain surface styling (`bg-card`); the right/selected column's entire background (not just the scroll box) is `bg-brand-muted`, separated from the left column by a `border-t border-brand md:border-t-0 md:border-l` divider (stacked columns on mobile need a top divider instead of a left one). The footer mirrors this as a two-column grid: a left spacer cell (hidden on mobile, `hidden md:block`) with no `border-t` — a bare `border-t` renders near-black via the `currentColor` fallback, because `--border` is only defined in `.dark`, not `:root` (see the [`ui-repo-conventions`](../../.claude/skills/ui-repo-conventions/SKILL.md) skill) — and a right cell holding the status span and "Confirm" button, which does carry `border-t border-brand md:border-l` explicitly for that reason. "Confirm" uses `bg-success`/`text-primary-foreground` (the same pairing [FlashcardRound](./FlashcardRound.md) uses for its correct-answer state) instead of the default button variant.

Touch targets: catalog buttons are `min-h-11`; the icon-only remove button is `size-11` (forced square) since its `icon-sm` variant is only 28px square by default, under the 44×44 minimum.

Clicking "Confirm" (disabled while `selectedWords` is empty) opens a naming `Dialog` rather than saving immediately, so the deck always has a name before `create_custom_category` is called. Confirming the dialog calls `supabase.rpc('create_custom_category', { p_name: deckName.trim(), p_word_ids: selectedIds })`; on success, navigates to `/my-decks`. On error, shows the RPC's error message inside the dialog instead of closing it, so the user doesn't lose their selection.

**Depends on:** [useWords](../hooks/useWords.md), `Card`/`Button`/`Input`/`Dialog` (and its subcomponents) from `src/components/ui/`, `lucide-react` (`X`), `useNavigate` from `react-router-dom`.

**Tested by:** [docs/tests/CreateDeckPage.md](../tests/CreateDeckPage.md).
