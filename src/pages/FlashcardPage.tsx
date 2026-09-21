import { useParams } from 'react-router-dom'
import { useRandomFlashcard } from '../hooks/useRandomFlashcard'
import { useWords } from '../hooks/useWords'
import { FlashcardRound } from '../components/FlashcardRound'
import './FlashcardPage.css'

export function FlashcardPage() {
  const { categoryId } = useParams<{ categoryId: string }>()
  const { flashcard, loading, error, empty, next } = useRandomFlashcard(categoryId ?? '')
  const { words, loading: wordsLoading, error: wordsError } = useWords()

  if (!categoryId) {
    return <p className="text-sm text-destructive">No category selected.</p>
  }

  if (loading || wordsLoading) {
    return <p className="text-sm text-muted-foreground">Loading flashcard...</p>
  }

  if (error || wordsError) {
    return (
      <p className="text-sm text-destructive">Failed to load flashcard: {error ?? wordsError}</p>
    )
  }

  if (empty || !flashcard) {
    return <p className="text-sm text-muted-foreground">This category has no flashcards yet.</p>
  }

  return (
    <div className="flashcard-page">
      <FlashcardRound
        flashcard={flashcard}
        words={words}
        advanceLabel="Next sign"
        onAdvance={() => next()}
      />
    </div>
  )
}
