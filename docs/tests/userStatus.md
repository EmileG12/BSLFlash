# userStatus.test.ts

**Path:** `src/lib/userStatus.test.ts`
**Tests:** [userStatus](../utils/userStatus.md)
**Suite:** `unit` (jsdom) — runs on `npm run test`

## Coverage

- `isBanned` is `false` when `banned_until` is `null`.
- `isBanned` is `true` for the literal string `'infinity'`, which is what `ban_user()` sets for an indefinite ban.
- `isBanned` is `true` for a future ISO timestamp.
- `isBanned` is `false` for a past ISO timestamp.

## Notes

Pure-function test: builds a `UserWithRoles` fixture and calls `isBanned` directly, with no rendering and no mocks.

The `'infinity'` case is a regression test. `new Date('infinity')` is an Invalid Date in JS, and an Invalid Date compares false against everything, so a naive `new Date(banned_until) > new Date()` check silently treats an indefinitely banned account as active. The Banned badge was broken this way until it was caught by manual browser testing against the real local stack. The test pins the explicit `'infinity'` branch in [userStatus](../utils/userStatus.md).
