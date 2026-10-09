# Components

React components, one doc file per component.

| Component | Path | Purpose |
|---|---|---|
| [LoginPage](./LoginPage.md) | `src/pages/LoginPage.tsx` | Email/password login form. |
| [SignupPage](./SignupPage.md) | `src/pages/SignupPage.tsx` | Account creation form (email, username, password, confirm password). |
| [HomePage](./HomePage.md) | `src/pages/HomePage.tsx` | Landing page for logged-in users; greeting + deck picker. |
| [SelectDeckCard](./SelectDeckCard.md) | `src/components/SelectDeckCard.tsx` | Card listing flashcard categories as buttons to pick a deck; wraps `DeckGrid`. |
| [DeckGrid](./DeckGrid.md) | `src/components/DeckGrid.tsx` | Presentational deck-list card (loading/error/empty/grid-of-buttons), shared by `SelectDeckCard` and `MyDecksPage`. |
| [CreateDeckPage](./CreateDeckPage.md) | `src/pages/CreateDeckPage.tsx` | Builds a custom deck from the word list via a two-column picker, then names and saves it. |
| [MyDecksPage](./MyDecksPage.md) | `src/pages/MyDecksPage.tsx` | Lists the user's custom decks; play or delete each one. |
| [ModeSelectPage](./ModeSelectPage.md) | `src/pages/ModeSelectPage.tsx` | Choose "Practice" or "10 Cards" for a category or custom deck. |
| [FlashcardPage](./FlashcardPage.md) | `src/pages/FlashcardPage.tsx` | "Practice" mode: an endless loop of random words, tracking a consecutive-correct streak. |
| [TenCardsPage](./TenCardsPage.md) | `src/pages/TenCardsPage.tsx` | "10 Cards" mode: a bounded, no-repeat round of up to 10 words, ending on a score. |
| [FlashcardRound](./FlashcardRound.md) | `src/components/FlashcardRound.tsx` | Shared per-card gameplay (video + guess combobox + reveal), used by both game modes. |
| [ScorePill](./ScorePill.md) | `src/components/ScorePill.tsx` | Shared score badge ("Score: x" or "Round: x/N \| Score: y/N"), used by both game modes. |
| [WordGuessCombobox](./WordGuessCombobox.md) | `src/components/WordGuessCombobox.tsx` | Searchable combobox over all words, used to guess the flashcard's word. |
| [NavBar](./NavBar.md) | `src/components/NavBar.tsx` | Top nav bar (Home link, Categories/Vocabulary dropdowns, Create Decks/My Decks links, Sign Out) shown on all authenticated pages. |
| [CategoryMenu](./CategoryMenu.md) | `src/components/CategoryMenu.tsx` | Hover-triggered nav dropdown listing flashcard categories; used twice by `NavBar` for Categories and Vocabulary. |
| [MobileNavSheet](./MobileNavSheet.md) | `src/components/MobileNavSheet.tsx` | Hamburger-triggered slide-in nav menu for narrow screens, rendered by `NavBar` alongside the desktop bar. |
| [AppLayout](./AppLayout.md) | `src/components/AppLayout.tsx` | Wraps authenticated pages with `NavBar`. |
| [ProtectedRoute](./ProtectedRoute.md) | `src/components/ProtectedRoute.tsx` | Redirects to `/login` when signed out. |
| [GuestRoute](./GuestRoute.md) | `src/components/GuestRoute.tsx` | Redirects to `/` when already signed in. |
| [AuthCard](./AuthCard.md) | `src/components/AuthCard.tsx` | Shared Card scaffold for `LoginPage`/`SignupPage`. |
| [LabeledInput](./LabeledInput.md) | `src/components/LabeledInput.tsx` | Shared label + input field, used by `LoginPage`/`SignupPage`. |
| [AuthSwitchLink](./AuthSwitchLink.md) | `src/components/AuthSwitchLink.tsx` | Shared "switch to the other auth page" link, used by `LoginPage`/`SignupPage`. |
