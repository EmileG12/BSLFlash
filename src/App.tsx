import { Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/AppLayout'
import { GuestRoute } from './components/GuestRoute'
import { ProtectedRoute } from './components/ProtectedRoute'
import { FlashcardPage } from './pages/FlashcardPage'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { ModeSelectPage } from './pages/ModeSelectPage'
import { SignupPage } from './pages/SignupPage'
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
          <Route path="/flashcards/:categoryId" element={<ModeSelectPage />} />
          <Route path="/flashcards/:categoryId/practice" element={<FlashcardPage />} />
          <Route path="/flashcards/:categoryId/ten-cards" element={<TenCardsPage />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App
