import { Route, Routes } from 'react-router-dom'
import { AdminRoute } from './components/AdminRoute'
import { AppLayout } from './components/AppLayout'
import { GuestRoute } from './components/GuestRoute'
import { ProtectedRoute } from './components/ProtectedRoute'
import { SuperadminRoute } from './components/SuperadminRoute'
import { AdminPage } from './pages/AdminPage'
import { BrowseDecksPage } from './pages/BrowseDecksPage'
import { CreateDeckPage } from './pages/CreateDeckPage'
import { FlashcardPage } from './pages/FlashcardPage'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { ModeSelectPage } from './pages/ModeSelectPage'
import { MyDecksPage } from './pages/MyDecksPage'
import { SignupPage } from './pages/SignupPage'
import { SuperadminAccountsPage } from './pages/SuperadminAccountsPage'
import { SuperadminCategoriesPage } from './pages/SuperadminCategoriesPage'
import { SuperadminRolesPage } from './pages/SuperadminRolesPage'
import { SuperadminWordEditPage } from './pages/SuperadminWordEditPage'
import { SuperadminWordsPage } from './pages/SuperadminWordsPage'
import { TenCardsPage } from './pages/TenCardsPage'

function App() {
  return (
    <Routes>
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/browse-decks" element={<BrowseDecksPage />} />
          <Route path="/create-decks" element={<CreateDeckPage />} />
          <Route path="/my-decks" element={<MyDecksPage />} />
          <Route path="/flashcards/:deckType/:categoryId" element={<ModeSelectPage />} />
          <Route path="/flashcards/:deckType/:categoryId/practice" element={<FlashcardPage />} />
          <Route path="/flashcards/:deckType/:categoryId/ten-cards" element={<TenCardsPage />} />

          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminPage />} />
          </Route>

          <Route element={<SuperadminRoute />}>
            <Route path="/superadmin/categories" element={<SuperadminCategoriesPage />} />
            <Route path="/superadmin/roles" element={<SuperadminRolesPage />} />
            <Route path="/superadmin/accounts" element={<SuperadminAccountsPage />} />
            <Route path="/superadmin/words" element={<SuperadminWordsPage />} />
            <Route path="/superadmin/words/:wordId" element={<SuperadminWordEditPage />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  )
}

export default App
