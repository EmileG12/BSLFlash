# ScorePill

**Path:** `src/components/ScorePill.tsx`

**Purpose:** The brand-colored pill showing the player's current score, rendered next to [FlashcardRound](./FlashcardRound.md)'s card. Shared by [FlashcardPage](./FlashcardPage.md) (Practice mode) and [TenCardsPage](./TenCardsPage.md) (10 Cards mode) so the two pages don't each hand-roll their own pill markup/styling.

**Props:**
| Prop | Type | Description |
|---|---|---|
| `score` | `number` | Correct-answer count so far — a running streak in Practice mode, or a tally out of `round.total` in a fixed-length round. |
| `round` | `{ current: number; total: number }` (optional) | Present only for fixed-length rounds. When given, renders a "Round: x/N" group, a divider, and a "Score: y/N" group; when omitted, renders just a "Score: y" group. |

**Key behavior:** A single component branches on whether `round` was passed, rather than the two pages each building their own pill markup — `FlashcardPage` calls `<ScorePill score={streak} />` (no `round`, since Practice is an endless loop with no round count), while `TenCardsPage` calls `<ScorePill score={correctCount} round={{ current: currentIndex + 1, total: cards.length }} />`.

**Layout:** `.flashcard-score-badge` (`ScorePill.css`) is `inline-flex items-center gap-2` — the badge itself is a flex row, not flowing inline text, so its top-level children (the "Round" group, an optional divider, the "Score" group) always vertically center by their own box height rather than by font baseline. Each group (e.g. `Round:` + `{round.current}` + `/{round.total}`) is its own nested `flex items-baseline gap-1` span, so the label and number baseline-align *within* the group while the groups themselves center against each other. This two-level structure exists specifically to avoid a real bug hit during development: mixing differently-sized inline text (`text-sm` labels next to `text-lg` numbers) in plain inline flow made things look vertically offset, because each Tailwind font-size utility bundles its own `line-height`, and those don't line up across sizes without deliberate control.

Two shape/color classes (both `ScorePill.css`) style the label/number split within each group:
- `.flashcard-score-label` (`text-sm leading-none`) — the small `Round:`/`Score:` text, inheriting `.flashcard-score-badge`'s `text-brand-foreground`.
- `.flashcard-score-value` (`text-brand-muted text-lg leading-none font-semibold`) — the actual number, bigger/bolder/lighter than its label, so the numbers read as the emphasized part of the pill.

`leading-none` (`line-height: 1`) on both is required, not optional: it has to sit on the same element that sets `text-sm`/`text-lg`, because those utilities bundle their own `line-height` which would otherwise override anything inherited from an ancestor.

The divider between the Round and Score groups (`round` case only) is `.flashcard-score-divider` (`h-4 w-px shrink-0 bg-brand-foreground/40`, `aria-hidden="true"`) — an empty, fixed-height/hairline-width `<span>` filled with a translucent color, not a text character. This sidesteps the same font-baseline problem a literal `|` glyph would reintroduce (a glyph's ink isn't necessarily centered in its own line box), by using a plain rectangle sized and centered by flexbox instead of by font metrics — the same technique commonly used for pill/badge dividers elsewhere on the web.

Uses `.flashcard-pill` (defined in `FlashcardRound.css`: `rounded-full px-3 py-1 text-sm font-medium` — the same shape class the correct/incorrect reveal badge in [FlashcardRound](./FlashcardRound.md) uses) alongside `.flashcard-score-badge`, which adds its own `box-shadow: 0 4px 6px var(--shadow-color)` drop shadow on top.

**Depends on:** `.flashcard-pill` from [FlashcardRound](./FlashcardRound.md)'s CSS (cross-file class reuse — Tailwind's compiled output is one global stylesheet, so this works without an explicit import, the same pattern `.flashcard-page` already relies on between `FlashcardPage.css` and `TenCardsPage.tsx`).

**Used by:** [FlashcardPage](./FlashcardPage.md), [TenCardsPage](./TenCardsPage.md).
