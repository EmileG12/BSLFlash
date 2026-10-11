# useCategoryInfo.test.ts

**Path:** `src/hooks/useCategoryInfo.test.ts`
**Tests:** [useCategoryInfo](../hooks/useCategoryInfo.md)

## Coverage

- Reports `isVocabulary: true` for a standard category with `is_vocabulary: true`, querying `categories`.
- Reports `isVocabulary: false` for a standard category with `is_vocabulary: false`.
- Always reports `isVocabulary: false` for a custom deck (querying `custom_decks`, which has no `is_vocabulary` column), regardless of what the mocked row contains.

## Notes

Mocks `../lib/supabase`'s `from` via an explicit factory replicating the `select().eq().maybeSingle()` chain. Uses `renderHook`/`waitFor` from `@testing-library/react`.
