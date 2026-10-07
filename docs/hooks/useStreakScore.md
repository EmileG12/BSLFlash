# useStreakScore

**Path:** `src/hooks/useStreakScore.ts`
**Signature:** `useStreakScore(): { streak: number; recordResult: (correct: boolean) => void; reset: () => void }`

**Purpose:** Tracks a consecutive-correct streak — increments on a correct result, resets to 0 on a wrong one. Backs the `Score: {streak}` pill in [FlashcardPage](../components/FlashcardPage.md) (Practice mode).

**Behavior:** `recordResult(correct)` increments `streak` when `correct` is `true`, otherwise sets it back to `0`. `reset()` sets `streak` to `0` unconditionally — `FlashcardPage` calls it whenever `categoryId` changes, so switching categories doesn't carry over a stale streak from a different deck. `recordResult`/`reset` are wrapped in `useCallback` (stable identity across renders) specifically so a caller can safely put `reset` in a `useEffect` dependency array without the effect re-firing every render.

Kept intentionally generic (no round-length limit, no termination on a wrong result) so a future "Blitz" mode (timed, ends on the first wrong answer or timeout) can reuse the same increment/reset primitive rather than needing this logic re-extracted out of `FlashcardPage` later.

**Used by:** [FlashcardPage](../components/FlashcardPage.md).
