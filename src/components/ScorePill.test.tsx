import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ScorePill } from './ScorePill'

// The numeral(s) render in their own nested <span> (styled separately from the labels), so the
// pill's full text isn't a single text node `getByText` can match directly.
function pillText(container: HTMLElement) {
  return container.querySelector('.flashcard-score-badge')?.textContent?.replace(/\s+/g, ' ').trim()
}

describe('ScorePill', () => {
  it('renders a Score pill when no round is given', () => {
    // Label/number spacing is visual (flex gap), not a text character — see the note below.
    const { container } = render(<ScorePill score={3} />)

    expect(pillText(container)).toBe('Score:3')
  })

  it('renders a Round.../Score... pill when a round is given', () => {
    // The divider between "Round:.../N" and "Score:.../N" is a visual flex-gap/bar (like the
    // between-group spacing), not a text character, so there's no literal space or "|" here.
    const { container } = render(<ScorePill score={2} round={{ current: 3, total: 10 }} />)

    expect(pillText(container)).toBe('Round:3/10Score:2/10')
  })
})
