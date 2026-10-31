# Architecture

Current state of the BSLFlash app, described honestly as of now.

## Stack

- **Frontend:** React 19 + TypeScript, built with Vite. Tailwind v4 for styling, with a small shadcn-originated component kit under `src/components/ui/`.
- **Backend:** Supabase (Postgres, Auth, Row Level Security, RPC/Postgres functions, Storage), run locally via Docker during development.
- **Package manager:** npm.

## Routing

Client-side routing via `react-router-dom`, defined in `src/App.tsx`:

| Path | Page | Access |
|---|---|---|
| `/login` | [LoginPage](./components/LoginPage.md) | Guest only ([GuestRoute](./components/GuestRoute.md) redirects to `/` if already signed in) |
| `/signup` | [SignupPage](./components/SignupPage.md) | Guest only |
| `/` | [HomePage](./components/HomePage.md) | Authenticated ([ProtectedRoute](./components/ProtectedRoute.md) redirects to `/login` if signed out) |
| `/create-decks` | [CreateDeckPage](./components/CreateDeckPage.md) | Authenticated |
| `/my-decks` | [MyDecksPage](./components/MyDecksPage.md) | Authenticated |
| `/browse-decks` | [BrowseDecksPage](./components/BrowseDecksPage.md) | Authenticated |
| `/flashcards/:deckType/:categoryId` | [ModeSelectPage](./components/ModeSelectPage.md) | Authenticated |
| `/flashcards/:deckType/:categoryId/practice` | [FlashcardPage](./components/FlashcardPage.md) | Authenticated |
| `/flashcards/:deckType/:categoryId/ten-cards` | [TenCardsPage](./components/TenCardsPage.md) | Authenticated |
| `/admin` | [AdminPage](./components/AdminPage.md) | Admin or superadmin ([AdminRoute](./components/AdminRoute.md)) |
| `/superadmin/categories` | [SuperadminCategoriesPage](./components/SuperadminCategoriesPage.md) | Superadmin only ([SuperadminRoute](./components/SuperadminRoute.md)) |
| `/superadmin/words` | [SuperadminWordsPage](./components/SuperadminWordsPage.md) | Superadmin only |
| `/superadmin/words/:wordId` | [SuperadminWordEditPage](./components/SuperadminWordEditPage.md) | Superadmin only |
| `/superadmin/roles` | [SuperadminRolesPage](./components/SuperadminRolesPage.md) | Superadmin only |
| `/superadmin/accounts` | [SuperadminAccountsPage](./components/SuperadminAccountsPage.md) | Superadmin only |

All three `/flashcards/...` routes also accept an optional `?subcategory=<id>` query param, carried through by [ModeSelectPage](./components/ModeSelectPage.md) when the category is a vocabulary category and a topic has been chosen via [SubCategoryChips](./components/SubCategoryChips.md); see the Flashcard game section below.

Authenticated routes are also wrapped in [AppLayout](./components/AppLayout.md), which renders the persistent [NavBar](./components/NavBar.md).

## Roles and admin area

Three roles exist in [`roles`](./db-schema/roles.md)/[`user_roles`](./db-schema/user_roles.md): `user` (granted automatically on signup by [`handle_new_user`](./rpc-functions/handle_new_user.md)), `admin`, and `superadmin`. `admin` is a separate role in the data, not a subset of `superadmin` — [`is_admin()`](./rpc-functions/is_admin.md) does not return true for a superadmin, so every "admin or superadmin" check (route guards, RLS policies) composes both checks explicitly. [useUserRoles](./hooks/useUserRoles.md) resolves both flags client-side for routing and nav; the database re-checks independently inside each RPC and RLS policy, since the client-side check is for UX only, not the security boundary.

An `admin` can add new words (with a first sign variant and video) and tag existing words into existing categories, via [AdminPage](./components/AdminPage.md) — nothing else. A `superadmin` additionally manages categories ([SuperadminCategoriesPage](./components/SuperadminCategoriesPage.md)), edits words and their full set of sign variants/videos ([SuperadminWordsPage](./components/SuperadminWordsPage.md), [SuperadminWordEditPage](./components/SuperadminWordEditPage.md)), grants/revokes roles ([SuperadminRolesPage](./components/SuperadminRolesPage.md)), and bans/unbans accounts ([SuperadminAccountsPage](./components/SuperadminAccountsPage.md)). [NavBar](./components/NavBar.md)'s Admin entry renders a single link for an admin and a dropdown over all five destinations for a superadmin.

## Auth

[useAuth](./hooks/useAuth.md) reactively tracks the current Supabase Auth session (used by `ProtectedRoute`/`GuestRoute` to gate routes, and by `HomePage` to greet the user). Sign-in/sign-out calls are wrapped in [`src/lib/auth.ts`](./utils/auth.md) rather than calling Supabase Auth directly from components — this keeps a clean mock boundary for tests.

## Data flow

The React app calls Supabase directly from the browser via the shared client in [`src/lib/supabase.ts`](./utils/supabase-client.md) (using the local stack's REST/Auth/Storage endpoints during development), rather than going through a separate backend API layer. Access control is enforced at the database layer via [RLS policies](./rls-policies/README.md), not application code.

The client is typed against the live schema via a generated `Database` type (`src/lib/database.types.ts`, regenerated after every migration — see the `migrations` skill) — table/column/RPC names and types are checked at compile time.

Reads go through React Query. Each data-fetching hook wraps its query in `useQuery` and keeps its original return shape, so components are unaffected. The single [`queryClient`](./utils/queryClient.md) (`src/lib/queryClient.ts`, provided via `QueryClientProvider` in `main.tsx`) is created with no options, so React Query's defaults apply unless a hook overrides them:

- A query is stale immediately, so a cached result is shown while a refetch runs on component mount, window focus, and reconnect. [useRandomFlashcard](./hooks/useRandomFlashcard.md) and [useTenCardsRound](./hooks/useTenCardsRound.md) opt out of the window-focus/reconnect refetch (`refetchOnWindowFocus: false`) specifically, since a random draw or an in-progress round should only change via `next()` or a fresh mount, not silently behind the user's back from refocusing the tab.
- A failed query is retried 3 times with exponential backoff (1s, 2s, 4s) before the hook reports `error`, so an error appears about 7 seconds after the first failure.
- The per-user query keys [`customDecks`](./hooks/useCustomDecks.md), [`savedDecks`](./hooks/useSavedDecks.md) and [`publicDecks`](./hooks/usePublicDecks.md) do not include the user id, so [`signOut`](./utils/auth.md) calls `queryClient.clear()` after signing out — otherwise a second user signing in on the same tab would briefly see the previous user's cached data before the next fetch replaces it.

Writes are not wrapped in React Query. Components call Supabase directly for inserts, updates, deletes and RPC mutations. Where a list must reflect a write without a refetch, the hook's `setX` function patches the cache entry (see [useCustomDecks](./hooks/useCustomDecks.md)).

## Flashcard game

The core feature: [HomePage](./components/HomePage.md) shows [SelectDeckCard](./components/SelectDeckCard.md), listing [categories](./db-schema/categories.md) as buttons. Clicking one navigates to [ModeSelectPage](./components/ModeSelectPage.md). For a vocabulary category (`is_vocabulary = true`, via [useCategoryInfo](./hooks/useCategoryInfo.md)), it also renders [SubCategoryChips](./components/SubCategoryChips.md), letting the user narrow the category's word pool to one overlapping topic category before picking a mode; the choice travels onward as a `?subcategory=` query param rather than a route segment, since it's an optional filter on an already-selected deck, not a new identity. [ModeSelectPage](./components/ModeSelectPage.md) offers two game modes, both built on the same shared [FlashcardRound](./components/FlashcardRound.md) component for per-card gameplay (video + [WordGuessCombobox](./components/WordGuessCombobox.md) + reveal — [useWords](./hooks/useWords.md) supplies the full searchable word list to both):

- **Practice** ([FlashcardPage](./components/FlashcardPage.md)): draws one random word at a time via [`get_random_word_for_category`](./rpc-functions/get_random_word_for_category.md) ([useRandomFlashcard](./hooks/useRandomFlashcard.md)), looping indefinitely with no score. Repeats are possible — a deliberate simplicity choice.
- **10 Cards** ([TenCardsPage](./components/TenCardsPage.md)): fetches up to 10 *distinct* random words up front via [`get_random_words_for_category`](./rpc-functions/get_random_words_for_category.md) ([useTenCardsRound](./hooks/useTenCardsRound.md)), steps through them one at a time, and ends on a score screen.

Both modes reveal correct/incorrect by comparing word **ids**, never text, since two different words can share text with different definitions — that comparison lives only in `FlashcardRound`.

Subcategory narrowing is enforced at the same two RPCs, not as separate functions: both take an optional `subcategory_id uuid DEFAULT NULL`, which intersects the existing category-membership predicate with a second [`word_categories`](./db-schema/word_categories.md) membership check when set. [`get_available_subcategories_for_category`](./rpc-functions/get_available_subcategories_for_category.md) is what `SubCategoryChips` calls to list only the topic categories that actually overlap the current vocabulary category, so a choice that would produce zero words is never offered.

The `categories → words → signs → sign_videos` relationship chain (see [db-schema/](./db-schema/README.md)) is: a category has many words (via [word_categories](./db-schema/word_categories.md)), a word has many sign variants ([signs](./db-schema/signs.md)), at most one marked `is_primary` per word, and a sign has many videos ([sign_videos](./db-schema/sign_videos.md)). Quizzing plays a random video from the word's primary sign. Videos live in the [`sign-videos`](./storage/sign-videos.md) Storage bucket.

### Custom decks

A user can also build their own decks from the existing word list, via [CreateDeckPage](./components/CreateDeckPage.md) (`/create-decks`) and manage them via [MyDecksPage](./components/MyDecksPage.md) (`/my-decks`), which lists them with [useCustomDecks](./hooks/useCustomDecks.md). A custom deck is a [`custom_decks`](./db-schema/custom_decks.md) row (owned via `user_id`) linked to words through [`custom_deck_words`](./db-schema/custom_deck_words.md) — the same junction-table shape as `word_categories`, but owner-scoped via RLS instead of "everyone reads, superadmin writes". [`create_custom_deck`](./rpc-functions/create_custom_deck.md) creates both the header row and its word links atomically.

Any deck can be published with `is_public` (set when the owner saves the deck, via [`update_custom_deck`](./rpc-functions/update_custom_deck.md)). Published decks are listed in the public directory at [BrowseDecksPage](./components/BrowseDecksPage.md) (`/browse-decks`), which is backed by [`get_public_decks`](./rpc-functions/get_public_decks.md) and filtered by tags. Tags are rows of [`categories`](./db-schema/categories.md) joined through [`custom_deck_tags`](./db-schema/custom_deck_tags.md). Users can like a deck ([`deck_likes`](./db-schema/deck_likes.md)) or add it to their library ([`saved_decks`](./db-schema/saved_decks.md), a live reference that is hidden, not deleted, while the deck is unpublished).

Both game modes play a custom deck exactly like a standard category: the URL carries a `deckType` segment (`'standard' | 'custom'`, the `DeckType` type exported from [useRandomFlashcard](./hooks/useRandomFlashcard.md)) alongside `categoryId`, e.g. `/flashcards/custom/:categoryId/practice`. [ModeSelectPage](./components/ModeSelectPage.md), [FlashcardRound](./components/FlashcardRound.md), [ScorePill](./components/ScorePill.md), and [useRoundProgress](./hooks/useRoundProgress.md) are untouched by this — only [useRandomFlashcard](./hooks/useRandomFlashcard.md)/[useTenCardsRound](./hooks/useTenCardsRound.md) and the two RPCs they call ([`get_random_word_for_category`](./rpc-functions/get_random_word_for_category.md)/[`get_random_words_for_category`](./rpc-functions/get_random_words_for_category.md)) branch on `deckType`, via an added `is_custom` parameter that selects whether `category_id` is looked up in `word_categories` or `custom_deck_words`.

## Installability (PWA)

The app is installable as a Progressive Web App. [`vite.config.ts`](../vite.config.ts) registers `vite-plugin-pwa` with `registerType: 'autoUpdate'`, which generates the web app manifest (name and short name "BSL Flash", `standalone` display) and a service worker. App icons are generated from `public/bsl-icon.svg` by `@vite-pwa/assets-generator`, configured in `pwa-assets.config.ts`, and written to `public/`.

In-app install UI is built on [useInstallPrompt](./hooks/useInstallPrompt.md): [InstallBanner](./components/InstallBanner.md) (mobile-only, dismissible, mounted by [AppLayout](./components/AppLayout.md)) and the "Install App" row in [MobileNavSheet](./components/MobileNavSheet.md), which shares [InstallInstructionsDialog](./components/InstallInstructionsDialog.md) for platforms with no one-tap prompt.

## Testing

Vitest + React Testing Library — see [tests/](./tests/README.md) for what's covered and the mocking conventions used throughout.

## Deployment

`main`/`staging` branches map to separate hosted Supabase projects and separate Vercel environments (Production/Preview), with migrations deployed via GitHub Actions rather than any manual step. See [deployment/](./deployment/README.md).
