import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useTenCardsRound } from '../hooks/useTenCardsRound'
import { useWords } from '../hooks/useWords'
import { FlashcardRound } from '../components/FlashcardRound'

export function TenCardsPage() {
  const { categoryId } = useParams<{ categoryId: string }>()
  const { cards, loading, error, empty } = useTenCardsRound(categoryId ?? '')
  const { words, loading: wordsLoading, error: wordsError } = useWords()
  const navigate = useNavigate()

  const [currentIndex, setCurrentIndex] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [phase, setPhase] = useState<'playing' | 'summary'>('playing')

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

  if (empty || cards.length === 0) {
    return <p className="text-sm text-muted-foreground">This category has no flashcards yet.</p>
  }

  function handleAdvance(result: { wordId: string; correct: boolean }) {
    if (result.correct) {
      setCorrectCount((count) => count + 1)
    }
    if (currentIndex + 1 >= cards.length) {
      setPhase('summary')
    } else {
      setCurrentIndex((index) => index + 1)
    }
  }

  const isLastCard = currentIndex === cards.length - 1

  if (phase === 'summary') {
    return (
      <div className="flashcard-page">
        <p className="text-lg font-medium">
          You scored {correctCount}/{cards.length}
        </p>
        <Button onClick={() => navigate(`/flashcards/${categoryId}`)}>Back to modes</Button>
      </div>
    )
  }

  return (
    <div className="flashcard-page">
      <FlashcardRound
        flashcard={cards[currentIndex]}
        words={words}
        advanceLabel={isLastCard ? 'See results' : 'Next card'}
        onAdvance={handleAdvance}
      />
    </div>
  )
}
