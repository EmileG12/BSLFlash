# HomePage

**Path:** `src/pages/HomePage.tsx`

**Purpose:** Landing page at `/` for logged-in users; deck picker for both everyday-topic and exam/qualification vocabulary.

**Props:** None.

**Key behavior:** Heading is task-first ("Pick a deck to practise") rather than a "Welcome, {email}" greeting, with a `CardDescription` explaining what SignStack is and how to use the page ("SignStack teaches British Sign Language through short video flashcards. Pick an everyday topic or an exam-linked list below, then test yourself sign by sign."). The title/description live in a `CardHeader` band inside the card (`border-b border-brand`, with `-mt-(--card-spacing)`/`pt-(--card-spacing)` to sit flush with the card's rounded corners) rather than a bare `<h1>` above it — this mirrors [CreateDeckPage](./CreateDeckPage.md)'s own header treatment. The band's background is `home-header-band` (`src/pages/HomePage.css`), a gradient reusing the exact `color-mix(in oklab, var(--brand) 30%, var(--background))` formula already shipped on the page `body` in `src/index.css`, just scoped to the header and nudged to a stronger 30% brand mix — chosen over a flat `bg-muted` so the first thing a user sees has some visual presence, and over `--brand-muted` because that token is defined identically near-white in both light and dark mode, which would break in dark mode.

Below the header, a single search `Input` (with a `Search` icon positioned absolutely inside it) filters both deck-picker sections at once via one shared `search` string held in local state. Renders a single `Card` containing both deck-picker sections — [SelectDeckCard](./SelectDeckCard.md) with `vocabulary={false}` ("Everyday topics", a `Tags` icon) and `vocabulary={true}` ("Exam & qualification lists", a `GraduationCap` icon) — separated by a plain `border-t` divider, rather than two separate `Card`s stacked on the page. Both are passed `variant="bare"` so [DeckGrid](./DeckGrid.md) renders their header/content markup without its own nested `Card` chrome inside the shared one, and both receive the same `search` value, so `SelectDeckCard` filters its own already-fetched list rather than the two lists being merged, filtered, and resplit.

**Depends on:** [SelectDeckCard](./SelectDeckCard.md), `Card`/`CardContent`/`CardHeader`/`CardTitle`/`CardDescription` from `src/components/ui/`, `Input` from `src/components/ui/`, `lucide-react` (`GraduationCap`, `Search`, `Tags`).
