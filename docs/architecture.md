# Architecture

Current state of the SignStack app, described honestly as of now.

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
| `/flashcards/:categoryId` | [ModeSelectPage](./components/ModeSelectPage.md) | Authenticated |
| `/flashcards/:categoryId/practice` | [FlashcardPage](./components/FlashcardPage.md) | Authenticated |
| `/flashcards/:categoryId/ten-cards` | [TenCardsPage](./components/TenCardsPage.md) | Authenticated |

Authenticated routes are also wrapped in [AppLayout](./components/AppLayout.md), which renders the persistent [NavBar](./components/NavBar.md).

## Auth

[useAuth](./hooks/useAuth.md) reactively tracks the current Supabase Auth session (used by `ProtectedRoute`/`GuestRoute` to gate routes, and by `HomePage` to greet the user). Sign-in/sign-out calls are wrapped in [`src/lib/auth.ts`](./utils/auth.md) rather than calling Supabase Auth directly from components — this keeps a clean mock boundary for tests.

## Data flow

The React app calls Supabase directly from the browser via the shared client in [`src/lib/supabase.ts`](./utils/supabase-client.md) (using the local stack's REST/Auth/Storage endpoints during development), rather than going through a separate backend API layer. Access control is enforced at the database layer via [RLS policies](./rls-policies/README.md), not application code.

The client is typed against the live schema via a generated `Database` type (`src/lib/database.types.ts`, regenerated after every migration — see the `migrations` skill) — table/column/RPC names and types are checked at compile time.

## Flashcard game

The core feature: [HomePage](./components/HomePage.md) shows [SelectDeckCard](./components/SelectDeckCard.md), listing [categories](./db-schema/categories.md) as buttons. Clicking one navigates to [ModeSelectPage](./components/ModeSelectPage.md), which offers two game modes, both built on the same shared [FlashcardRound](./components/FlashcardRound.md) component for per-card gameplay (video + [WordGuessCombobox](./components/WordGuessCombobox.md) + reveal — [useWords](./hooks/useWords.md) supplies the full searchable word list to both):

- **Practice** ([FlashcardPage](./components/FlashcardPage.md)): draws one random word at a time via [`get_random_word_for_category`](./rpc-functions/get_random_word_for_category.md) ([useRandomFlashcard](./hooks/useRandomFlashcard.md)), looping indefinitely with no score. Repeats are possible — a deliberate simplicity choice.
- **10 Cards** ([TenCardsPage](./components/TenCardsPage.md)): fetches up to 10 *distinct* random words up front via [`get_random_words_for_category`](./rpc-functions/get_random_words_for_category.md) ([useTenCardsRound](./hooks/useTenCardsRound.md)), steps through them one at a time, and ends on a score screen.

Both modes reveal correct/incorrect by comparing word **ids**, never text, since two different words can share text with different definitions — that comparison lives only in `FlashcardRound`.

The `categories → words → signs → sign_videos` relationship chain (see [db-schema/](./db-schema/README.md)) is: a category has many words (via [word_categories](./db-schema/word_categories.md)), a word has many sign variants ([signs](./db-schema/signs.md)), and a sign has many videos ([sign_videos](./db-schema/sign_videos.md)), at most one marked `is_primary` per sign. Videos live in the [`sign-videos`](./storage/sign-videos.md) Storage bucket.

## Testing

Vitest + React Testing Library — see [tests/](./tests/README.md) for what's covered and the mocking conventions used throughout.
