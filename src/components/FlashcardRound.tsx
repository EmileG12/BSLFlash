import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { WordGuessCombobox } from './WordGuessCombobox'
import type { Flashcard } from '../hooks/useRandomFlashcard'
import type { WordOption } from '../hooks/useWords'
import './FlashcardRound.css'

interface FlashcardRoundProps {
  flashcard: Flashcard
  words: WordOption[]
  advanceLabel: string
  onAdvance: (result: { wordId: string; correct: boolean }) => void
}

type Phase = 'guessing' | 'revealed'

export function FlashcardRound({ flashcard, words, advanceLabel, onAdvance }: FlashcardRoundProps) {
  const [phase, setPhase] = useState<Phase>('guessing')
  const [guessedWordId, setGuessedWordId] = useState<string | null>(null)
  const [videoError, setVideoError] = useState(false)

  function handleSubmit(wordId: string) {
    setGuessedWordId(wordId)
    setPhase('revealed')
  }

  function handleAdvance() {
    onAdvance({ wordId: flashcard.wordId, correct: isCorrect })
    setPhase('guessing')
    setGuessedWordId(null)
    setVideoError(false)
  }

  const isCorrect = guessedWordId === flashcard.wordId

  useEffect(() => {
    if (phase !== 'revealed') {
      return
    }

    // Ignore browser auto-repeat: holding down the Enter that just confirmed the guess (in
    // WordGuessCombobox) can otherwise fire repeat 'keydown' events here too, advancing past
    // the reveal before the user has had a chance to read it.
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Enter' && !event.repeat) {
        handleAdvance()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  })

  return (
    <>
      {videoError ? (
        <p className="text-sm text-destructive">Video failed to load.</p>
      ) : (
        <video
          key={flashcard.videoUrl}
          src={flashcard.videoUrl}
          className="flashcard-video"
          controls
          autoPlay
          muted
          playsInline
          onError={() => setVideoError(true)}
        />
      )}

      {phase === 'guessing' ? (
        <WordGuessCombobox words={words} onSubmit={handleSubmit} />
      ) : (
        <div className="flex flex-col items-center gap-2">
          <p className={isCorrect ? 'text-success font-medium' : 'text-destructive font-medium'}>
            {isCorrect ? 'Correct!' : 'Incorrect.'}
          </p>
          <p className="text-sm text-muted-foreground">
            {flashcard.word} — {flashcard.definition}
          </p>
          <Button type="button" onClick={handleAdvance}>
            {advanceLabel}
          </Button>
        </div>
      )}
    </>
  )
}
