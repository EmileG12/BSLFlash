import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useTenCardsRound } from '../hooks/useTenCardsRound'
import { useWords } from '../hooks/useWords'
import { useRoundProgress } from '../hooks/useRoundProgress'
import { FlashcardRound } from '../components/FlashcardRound'
import { ScorePill } from '../components/ScorePill'

export function TenCardsPage() {
  const { categoryId } = useParams<{ categoryId: string }>()
  const { cards, loading, error, empty } = useTenCardsRound(categoryId ?? '')
  const { words, loading: wordsLoading, error: wordsError } = useWords()
  const navigate = useNavigate()

  const { currentIndex, correctCount, phase, isLastCard, handleAdvance } = useRoundProgress(
    cards.length,
  )

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
    <div className="flashcard-round-page">
      <div className="flashcard-round-wrap">
        <FlashcardRound
          flashcard={cards[currentIndex]}
          words={words}
          advanceLabel={isLastCard ? 'See results' : 'Next card'}
          onAdvance={handleAdvance}
        />
        <ScorePill
          score={correctCount}
          round={{ current: currentIndex + 1, total: cards.length }}
        />
      </div>
    </div>
  )
}
