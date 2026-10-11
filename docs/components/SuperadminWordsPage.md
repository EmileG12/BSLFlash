# SuperadminWordsPage

**Path:** `src/pages/SuperadminWordsPage.tsx` · **Route:** `/superadmin/words` (behind [SuperadminRoute](./SuperadminRoute.md))

**Purpose:** Index of every word, for finding one to edit. Shows the word and its definition in a table.

**Key behavior:** Each row is clickable and navigates to `/superadmin/words/:wordId`, the [SuperadminWordEditPage](./SuperadminWordEditPage.md). Search is a client-side, case-insensitive substring match on the word text. Words come from the shared [useWords](../hooks/useWords.md) hook, not a superadmin-specific query.

Creating a word is not on this page; that is done on [AdminPage](./AdminPage.md), which admins and superadmins can both reach.

**Depends on:** [useWords](../hooks/useWords.md), `Input`/`Table` from `src/components/ui/`.

**Used by:** the `/superadmin/words` route in `src/App.tsx`, linked from [NavBar](./NavBar.md) and [MobileNavSheet](./MobileNavSheet.md).
