# useStreakScore.test.ts

**Path:** `src/hooks/useStreakScore.test.ts`
**Tests:** [useStreakScore](../hooks/useStreakScore.md)

## Coverage

- Starts at `streak: 0`.
- Increments on each correct `recordResult(true)` call.
- Resets to `0` on a `recordResult(false)` call, even after a positive streak.
- `reset()` sets the streak back to `0`.

## Notes

Uses `renderHook`/`act` from `@testing-library/react` — no Supabase mocking needed, since this hook is pure local state with no data fetching.
