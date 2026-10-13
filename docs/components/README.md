# Components

React components, one doc file per component.

| Component | Path | Purpose |
|---|---|---|
| [LoginPage](./LoginPage.md) | `src/pages/LoginPage.tsx` | Email/password login form. |
| [SignupPage](./SignupPage.md) | `src/pages/SignupPage.tsx` | Account creation form (email, username, password, confirm password). |
| [HomePage](./HomePage.md) | `src/pages/HomePage.tsx` | Landing page for logged-in users; deck picker for everyday topics and exam/qualification lists. |
| [SelectDeckCard](./SelectDeckCard.md) | `src/components/SelectDeckCard.tsx` | Card listing flashcard categories as buttons to pick a deck; wraps `DeckGrid`. |
| [DeckGrid](./DeckGrid.md) | `src/components/DeckGrid.tsx` | Presentational deck-list card (loading/error/empty/grid-of-buttons), shared by `SelectDeckCard` and `MyDecksPage`. |
| [CreateDeckPage](./CreateDeckPage.md) | `src/pages/CreateDeckPage.tsx` | Builds a custom deck from the word list (via `WordPicker`), then names and saves it. |
| [WordPicker](./WordPicker.md) | `src/components/WordPicker.tsx` | Two-column searchable word catalog and selected-words list, shared by `CreateDeckPage` and `EditDeckModal`. |
| [MyDecksPage](./MyDecksPage.md) | `src/pages/MyDecksPage.tsx` | "My Decks" (own custom decks, play, edit, or delete) and "Saved Decks" (directory decks, play or remove from library). |
| [EditDeckModal](./EditDeckModal.md) | `src/components/EditDeckModal.tsx` | Owner-only dialog to rename a deck, change its words and tags, and toggle publishing. |
| [BrowseDecksPage](./BrowseDecksPage.md) | `src/pages/BrowseDecksPage.tsx` | Public deck directory: search, sort, tag filters, play, like, and save to library. |
| [TagFilterChips](./TagFilterChips.md) | `src/components/TagFilterChips.tsx` | Multi-select (AND) tag chips for the Browse directory's filter bar. |
| [TagPicker](./TagPicker.md) | `src/components/TagPicker.tsx` | Multi-select tag chips over every category, for tagging a deck in `EditDeckModal`. |
| [TagChipList](./TagChipList.md) | `src/components/TagChipList.tsx` | Presentational multi-select tag chip row, shared by `TagFilterChips` and `TagPicker`. |
| [ModeSelectPage](./ModeSelectPage.md) | `src/pages/ModeSelectPage.tsx` | Choose "Practice" or "10 Cards" for a category or custom deck. |
| [SubCategoryChips](./SubCategoryChips.md) | `src/components/SubCategoryChips.tsx` | "Narrow by topic" chip picker, shown on `ModeSelectPage` for vocabulary categories only. |
| [FlashcardPage](./FlashcardPage.md) | `src/pages/FlashcardPage.tsx` | "Practice" mode: an endless loop of random words, with no score. |
| [TenCardsPage](./TenCardsPage.md) | `src/pages/TenCardsPage.tsx` | "10 Cards" mode: a bounded, no-repeat round of up to 10 words, ending on a score. |
| [FlashcardRound](./FlashcardRound.md) | `src/components/FlashcardRound.tsx` | Shared per-card gameplay (video + guess combobox + reveal), used by both game modes. |
| [TableCard](./TableCard.md) | `src/components/TableCard.tsx` | Flush panel wrapper for admin data tables, with an optional toolbar band in the same shell. |
| [ScorePill](./ScorePill.md) | `src/components/ScorePill.tsx` | Score badge ("Round: x/N \| Score: y/N") for fixed-length rounds, used by 10 Cards. |
| [WordGuessCombobox](./WordGuessCombobox.md) | `src/components/WordGuessCombobox.tsx` | Searchable combobox over all words, used to guess the flashcard's word. |
| [NavBar](./NavBar.md) | `src/components/NavBar.tsx` | Top nav bar (Home link, Categories/Vocabulary dropdowns, Create Decks/My Decks/Browse Decks links, role-gated Admin entry, Sign Out) shown on all authenticated pages. |
| [CategoryMenu](./CategoryMenu.md) | `src/components/CategoryMenu.tsx` | Hover-triggered nav dropdown listing flashcard categories; used twice by `NavBar` for Categories and Vocabulary. |
| [MobileNavSheet](./MobileNavSheet.md) | `src/components/MobileNavSheet.tsx` | Hamburger-triggered slide-in nav menu for narrow screens, rendered by `NavBar` alongside the desktop bar. |
| [AppLayout](./AppLayout.md) | `src/components/AppLayout.tsx` | Wraps authenticated pages with `NavBar`. |
| [ProtectedRoute](./ProtectedRoute.md) | `src/components/ProtectedRoute.tsx` | Redirects to `/login` when signed out. |
| [GuestRoute](./GuestRoute.md) | `src/components/GuestRoute.tsx` | Redirects to `/` when already signed in. |
| [AuthCard](./AuthCard.md) | `src/components/AuthCard.tsx` | Shared Card scaffold for `LoginPage`/`SignupPage`. |
| [LabeledInput](./LabeledInput.md) | `src/components/LabeledInput.tsx` | Shared label + input field, used by `LoginPage`/`SignupPage`. |
| [AuthSwitchLink](./AuthSwitchLink.md) | `src/components/AuthSwitchLink.tsx` | Shared "switch to the other auth page" link, used by `LoginPage`/`SignupPage`. |
| [AdminRoute](./AdminRoute.md) | `src/components/AdminRoute.tsx` | Route guard for `/admin`: admins and superadmins only. |
| [SuperadminRoute](./SuperadminRoute.md) | `src/components/SuperadminRoute.tsx` | Route guard for `/superadmin/*`: superadmins only. |
| [AdminPage](./AdminPage.md) | `src/pages/AdminPage.tsx` | `/admin`: add a new word with its first video and tag it into categories; add or remove a word's category tags. |
| [SuperadminCategoriesPage](./SuperadminCategoriesPage.md) | `src/pages/SuperadminCategoriesPage.tsx` | `/superadmin/categories`: create categories, rename them, toggle vocabulary and active flags. |
| [SuperadminRolesPage](./SuperadminRolesPage.md) | `src/pages/SuperadminRolesPage.tsx` | `/superadmin/roles`: grant and revoke the admin and superadmin roles. |
| [SuperadminAccountsPage](./SuperadminAccountsPage.md) | `src/pages/SuperadminAccountsPage.tsx` | `/superadmin/accounts`: ban and unban accounts. |
| [SuperadminWordsPage](./SuperadminWordsPage.md) | `src/pages/SuperadminWordsPage.tsx` | `/superadmin/words`: searchable word list that links to each word's edit page. |
| [SuperadminWordEditPage](./SuperadminWordEditPage.md) | `src/pages/SuperadminWordEditPage.tsx` | `/superadmin/words/:wordId`: edit a word, choose its primary variant, and add videos and variants. |
