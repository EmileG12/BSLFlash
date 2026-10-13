import { useParams, useSearchParams } from 'react-router-dom'
import { useRandomFlashcard } from '../hooks/useRandomFlashcard'
import { useWords } from '../hooks/useWords'
import { FlashcardRound } from '../components/FlashcardRound'
import './FlashcardPage.css'

export function FlashcardPage() {
  const { deckType, categoryId } = useParams<{ deckType: string; categoryId: string }>()
  const isValidDeckType = deckType === 'standard' || deckType === 'custom'
  const [searchParams] = useSearchParams()
  const subcategoryId = searchParams.get('subcategory')
  const { flashcard, loading, error, empty, next } = useRandomFlashcard(
    categoryId ?? '',
    isValidDeckType ? deckType : 'standard',
    subcategoryId,
  )
  const { words, loading: wordsLoading, error: wordsError } = useWords()

  if (!categoryId || !isValidDeckType) {
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
