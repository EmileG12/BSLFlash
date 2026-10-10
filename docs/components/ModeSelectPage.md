# ModeSelectPage

**Path:** `src/pages/ModeSelectPage.tsx`
**Route:** `/flashcards/:deckType/:categoryId` (authenticated, inside [AppLayout](./AppLayout.md))

**Purpose:** Sits between picking a category ([SelectDeckCard](./SelectDeckCard.md) or [MyDecksPage](./MyDecksPage.md)) and actually playing — lets the user choose "Practice" or "10 Cards" for the category/deck they just picked.

**Props:** None — reads `deckType` and `categoryId` from the URL via `useParams`. `deckType` (`'standard' | 'custom'`, see [useRandomFlashcard](../hooks/useRandomFlashcard.md)'s `DeckType`) is validated the same way as on [FlashcardPage](./FlashcardPage.md)/[TenCardsPage](./TenCardsPage.md) (`deckType === 'standard' || deckType === 'custom'`), falling into the "No category selected" error state otherwise — an unrecognized value in the URL is rejected here rather than silently passed through to default to `'standard'` further down.

**Key behavior:** Each mode renders as a `ModeTile` — an icon in a brand-muted circle, a label, and a one-line subtitle, stacked in a bordered tile — rather than a plain text button, because "Practice" and "10 Cards" alone gave no sense of what either mode actually does: `ModeTile` pairs `Infinity`/"Practice"/"Untimed, keep going" with navigation to `/flashcards/:deckType/:categoryId/practice` ([FlashcardPage](./FlashcardPage.md)), and `ListOrdered`/"10 Cards"/"Timed round, scored" with `/flashcards/:deckType/:categoryId/ten-cards` ([TenCardsPage](./TenCardsPage.md)).

The tile's accessible name is set explicitly via `aria-label={label}` on the `<button>`, and all three inner spans (icon, label, subtitle) are `aria-hidden="true"`. Without that, the subtitle's text would get folded into the button's accessible name automatically (it's inside the button), announcing label and subtitle as one run-on string — `aria-hidden` on the inner content plus an explicit `aria-label` keeps the accessible name to just the label.

No data fetching of its own. The outer `Card` reuses [SelectDeckCard](./SelectDeckCard.md)'s `select-deck-card` class, and the page wraps its content in the same centering layout (`mx-auto flex max-w-4xl flex-col gap-6 p-4`) as [HomePage](./HomePage.md). The tile grid and tile styling live in `ModeSelectPage.css` (`.mode-select-grid`, `.mode-tile`, `.mode-tile-icon`, `.mode-tile-label`, `.mode-tile-subtitle`) rather than reusing `select-deck-button` — a `ModeTile` needs room for icon + label + subtitle, which the plain deck-button class doesn't lay out. `.mode-tile` hover/focus state darkens its bottom border and tints its text to `--brand`, and swaps `.mode-tile-icon` from `bg-brand-muted`/`text-brand` to `bg-brand`/`text-brand-foreground` — the same icon-chip treatment used elsewhere (e.g. [DeckGrid](./DeckGrid.md)'s `icon` prop).

**Depends on:** `Card`/`CardContent`/`CardHeader`/`CardTitle` from `src/components/ui/`, `lucide-react` (`Infinity`, `ListOrdered`), `useNavigate`/`useParams` from `react-router-dom`, `src/components/SelectDeckCard.css`, `src/pages/ModeSelectPage.css`.
