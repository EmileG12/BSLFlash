import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useRandomFlashcard } from '../hooks/useRandomFlashcard'
import { useWords } from '../hooks/useWords'
import { WordGuessCombobox } from '../components/WordGuessCombobox'
import './FlashcardPage.css'

type Phase = 'guessing' | 'revealed'

export function FlashcardPage() {
  const { categoryId } = useParams<{ categoryId: string }>()
  const { flashcard, loading, error, empty, next } = useRandomFlashcard(categoryId ?? '')
  const { words, loading: wordsLoading, error: wordsError } = useWords()

  const [phase, setPhase] = useState<Phase>('guessing')
  const [guessedWordId, setGuessedWordId] = useState<string | null>(null)
  const [videoError, setVideoError] = useState(false)

  function handleSubmit(wordId: string) {
    setGuessedWordId(wordId)
    setPhase('revealed')
  }

  function handleNext() {
    next()
    setPhase('guessing')
    setGuessedWordId(null)
    setVideoError(false)
  }

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

  const isCorrect = guessedWordId === flashcard.wordId

  return (
    <div className="flashcard-page">
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
          <Button type="button" onClick={handleNext}>
            Next sign
          </Button>
        </div>
      )}
    </div>
  )
}
