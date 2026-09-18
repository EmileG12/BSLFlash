# Components

React components, one doc file per component.

| Component | Path | Purpose |
|---|---|---|
| [LoginPage](./LoginPage.md) | `src/pages/LoginPage.tsx` | Email/password login form. |
| [SignupPage](./SignupPage.md) | `src/pages/SignupPage.tsx` | Account creation form (email, username, password, confirm password). |
| [HomePage](./HomePage.md) | `src/pages/HomePage.tsx` | Landing page for logged-in users; greeting + deck picker. |
| [SelectDeckCard](./SelectDeckCard.md) | `src/components/SelectDeckCard.tsx` | Card listing flashcard categories as buttons to pick a deck. |
| [FlashcardPage](./FlashcardPage.md) | `src/pages/FlashcardPage.tsx` | The flashcard guessing game: video + guess combobox + reveal. |
| [WordGuessCombobox](./WordGuessCombobox.md) | `src/components/WordGuessCombobox.tsx` | Searchable combobox over all words, used to guess the flashcard's word. |
| [NavBar](./NavBar.md) | `src/components/NavBar.tsx` | Top nav bar (Home link + Sign Out) shown on all authenticated pages. |
| [AppLayout](./AppLayout.md) | `src/components/AppLayout.tsx` | Wraps authenticated pages with `NavBar`. |
| [ProtectedRoute](./ProtectedRoute.md) | `src/components/ProtectedRoute.tsx` | Redirects to `/login` when signed out. |
| [GuestRoute](./GuestRoute.md) | `src/components/GuestRoute.tsx` | Redirects to `/` when already signed in. |
| [AuthCard](./AuthCard.md) | `src/components/AuthCard.tsx` | Shared Card scaffold for `LoginPage`/`SignupPage`. |
| [LabeledInput](./LabeledInput.md) | `src/components/LabeledInput.tsx` | Shared label + input field, used by `LoginPage`/`SignupPage`. |
| [AuthSwitchLink](./AuthSwitchLink.md) | `src/components/AuthSwitchLink.tsx` | Shared "switch to the other auth page" link, used by `LoginPage`/`SignupPage`. |
