import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useStreakScore } from './useStreakScore'

describe('useStreakScore', () => {
  it('starts at 0', () => {
    const { result } = renderHook(() => useStreakScore())

    expect(result.current.streak).toBe(0)
  })

  it('increments on each correct result', () => {
    const { result } = renderHook(() => useStreakScore())

    act(() => result.current.recordResult(true))
    act(() => result.current.recordResult(true))

    expect(result.current.streak).toBe(2)
  })

  it('resets to 0 on a wrong result', () => {
    const { result } = renderHook(() => useStreakScore())

    act(() => result.current.recordResult(true))
    act(() => result.current.recordResult(true))
    act(() => result.current.recordResult(false))

    expect(result.current.streak).toBe(0)
  })

  it('reset() sets the streak back to 0', () => {
    const { result } = renderHook(() => useStreakScore())

    act(() => result.current.recordResult(true))
    act(() => result.current.reset())

    expect(result.current.streak).toBe(0)
  })
})
