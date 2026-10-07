import './ScorePill.css'

interface ScorePillProps {
  /** Correct-answer count so far — a running streak in Practice mode, or a tally out of `round.total` in a fixed-length round. */
  score: number
  /** Present only for fixed-length rounds (e.g. "10 Cards"): renders "Round: x/N | Score: y/N" instead of just "Score: y". */
  round?: { current: number; total: number }
}

/** The brand-colored pill showing the player's current score, rendered beside FlashcardRound's card. Shared by FlashcardPage (Practice, no `round`) and TenCardsPage (fixed-length round, `round` given). */
export function ScorePill({ score, round }: ScorePillProps) {
  return (
    <span className="flashcard-score-badge flashcard-pill">
      {round ? (
        <>
          <span className="flex items-baseline gap-1">
            <span className="flashcard-score-label">Round:</span>
            <span className="flashcard-score-value">{round.current}</span>
            <span>/{round.total}</span>
          </span>
          <span className="flashcard-score-divider" aria-hidden="true" />
          <span className="flex items-baseline gap-1">
            <span className="flashcard-score-label">Score:</span>
            <span className="flashcard-score-value">{score}</span>
            <span>/{round.total}</span>
          </span>
        </>
      ) : (
        <>
          <span className="flex items-baseline gap-1">
            <span className="flashcard-score-label">Score:</span>
            <span className="flashcard-score-value">{score}</span>
          </span>
        </>
      )}
    </span>
  )
}
