# CreateDeckPage

**Path:** `src/pages/CreateDeckPage.tsx`
**Route:** `/create-decks` (authenticated, inside [AppLayout](./AppLayout.md))

**Purpose:** Lets a user build a custom deck from the full word list, then name it and save it through [`create_custom_deck`](../rpc-functions/create_custom_deck.md). The word picker itself is [WordPicker](./WordPicker.md), which this page renders and which [EditDeckModal](./EditDeckModal.md) also uses. This page owns the card chrome, the selection state, and the naming step. Reached via the "Create Decks" link in [NavBar](./NavBar.md).

**Props:** None — all state is local to the page.

**Layout:** The `Card` is `h-auto` on mobile and `md:h-[75vh]` from `md` up, so only from `md` up does the card hold a fixed height regardless of word count. `CardContent` is `flex-1 min-h-0` and fills the space left after the header and footer, and it lays out [WordPicker](./WordPicker.md)'s two columns in a grid.

`CardHeader`, `CardContent`, and `CardFooter` each carry `-mt-(--card-spacing)`, one per component, to cancel one instance of `Card`'s own `gap-(--card-spacing)`/top `py` between its children. Without it, the header's `bg-muted` fill, the vertical `border-brand` column divider, and the footer's `bg-brand-muted` tray would each stop short of the next section by a visible gap instead of reading as continuous.

**Key behavior:** Fetches the full word list via [useWords](../hooks/useWords.md). `selectedIds: string[]` tracks which word ids have been added. [WordPicker](./WordPicker.md) calls `handleAdd`/`handleRemove` on the page, and this page is the only owner of the selection. Words move between the picker's two lists rather than being independently toggled.

The running total renders as a single `role="status" aria-live="polite" aria-atomic="true"` span in the footer ("`{n} word(s) selected`") rather than a live region per row, so a selection change produces one atomic announcement instead of one per list item. The count is `selectedIds.length`.

The card header (title + a one-line usage description) uses `border-b border-brand bg-muted`. The footer mirrors the picker's two-column split as a grid: a left spacer cell (hidden on mobile, `hidden md:block`) with no `border-t`, and a right cell holding the status span and "Confirm" button, which carries `border-t border-brand md:border-l` explicitly. "Confirm" uses `bg-success`/`text-primary-foreground` (the same pairing [FlashcardRound](./FlashcardRound.md) uses for its correct-answer state) instead of the default button variant.

Clicking "Confirm" (disabled while `selectedIds` is empty) opens a naming `Dialog` rather than saving immediately, so the deck always has a name before `create_custom_deck` is called. Confirming the dialog calls `supabase.rpc('create_custom_deck', { p_name: deckName.trim(), p_word_ids: selectedIds })`; on success, navigates to `/my-decks`. On error, shows the RPC's error message inside the dialog instead of closing it, so the user doesn't lose their selection.

**Depends on:** [useWords](../hooks/useWords.md), [WordPicker](./WordPicker.md), `Card`/`Button`/`Input`/`Dialog` (and its subcomponents) from `src/components/ui/`, `useNavigate` from `react-router-dom`.

**Tested by:** [docs/tests/CreateDeckPage.md](../tests/CreateDeckPage.md).
