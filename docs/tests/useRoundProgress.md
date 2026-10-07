# useRoundProgress.test.ts

**Path:** `src/hooks/useRoundProgress.test.ts`
**Tests:** [useRoundProgress](../hooks/useRoundProgress.md)

## Coverage

- Starts at `currentIndex: 0`, `correctCount: 0`, `phase: 'playing'`, `isLastCard: false`.
- `handleAdvance` with a correct result advances `currentIndex` and increments `correctCount`.
- `handleAdvance` with a wrong result advances `currentIndex` without incrementing `correctCount`.
- Advancing past the last card (rather than beyond it) flips `phase` to `'summary'` instead of incrementing `currentIndex` further.

## Notes

Uses `renderHook`/`act` from `@testing-library/react` — no Supabase mocking needed, since this hook only manages round-progress bookkeeping, not data fetching.
