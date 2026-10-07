import { useCallback, useState } from 'react'

interface StreakScoreState {
  streak: number
  recordResult: (correct: boolean) => void
  reset: () => void
}

/** Tracks a consecutive-correct streak: increments on a correct result, resets to 0 on a wrong one. */
export function useStreakScore(): StreakScoreState {
  const [streak, setStreak] = useState(0)

  // Stable references so callers can safely list `reset`/`recordResult` in a useEffect
  // dependency array without the effect re-firing on every render.
  const recordResult = useCallback((correct: boolean) => {
    setStreak((count) => (correct ? count + 1 : 0))
  }, [])

  const reset = useCallback(() => {
    setStreak(0)
  }, [])

  return { streak, recordResult, reset }
}
