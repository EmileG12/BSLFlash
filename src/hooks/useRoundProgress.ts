import { useState } from 'react'

type Phase = 'playing' | 'summary'

interface RoundProgressState {
  currentIndex: number
  correctCount: number
  phase: Phase
  isLastCard: boolean
  handleAdvance: (result: { wordId: string; correct: boolean }) => void
}

/** Steps through a fixed-length round of `totalCards`, tallying correct guesses and flipping to 'summary' after the last card. */
export function useRoundProgress(totalCards: number): RoundProgressState {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [phase, setPhase] = useState<Phase>('playing')

  function handleAdvance(result: { wordId: string; correct: boolean }) {
    if (result.correct) {
      setCorrectCount((count) => count + 1)
    }
    if (currentIndex + 1 >= totalCards) {
      setPhase('summary')
    } else {
      setCurrentIndex((index) => index + 1)
    }
  }

  const isLastCard = currentIndex === totalCards - 1

  return { currentIndex, correctCount, phase, isLastCard, handleAdvance }
}
