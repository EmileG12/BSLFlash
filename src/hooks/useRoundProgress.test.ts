import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useRoundProgress } from './useRoundProgress'

describe('useRoundProgress', () => {
  it('starts at card 0 with no correct answers, playing', () => {
    const { result } = renderHook(() => useRoundProgress(3))

    expect(result.current.currentIndex).toBe(0)
    expect(result.current.correctCount).toBe(0)
    expect(result.current.phase).toBe('playing')
    expect(result.current.isLastCard).toBe(false)
  })

  it('advances currentIndex and tallies correct answers', () => {
    const { result } = renderHook(() => useRoundProgress(3))

    act(() => result.current.handleAdvance({ wordId: 'w1', correct: true }))

    expect(result.current.currentIndex).toBe(1)
    expect(result.current.correctCount).toBe(1)
    expect(result.current.phase).toBe('playing')
  })

  it('does not increment correctCount on a wrong answer', () => {
    const { result } = renderHook(() => useRoundProgress(3))

    act(() => result.current.handleAdvance({ wordId: 'w1', correct: false }))

    expect(result.current.currentIndex).toBe(1)
    expect(result.current.correctCount).toBe(0)
  })

  it('flips to summary after the last card instead of advancing past it', () => {
    const { result } = renderHook(() => useRoundProgress(2))

    act(() => result.current.handleAdvance({ wordId: 'w1', correct: true }))
    expect(result.current.isLastCard).toBe(true)

    act(() => result.current.handleAdvance({ wordId: 'w2', correct: true }))

    expect(result.current.phase).toBe('summary')
    expect(result.current.correctCount).toBe(2)
    expect(result.current.currentIndex).toBe(1)
  })
})
