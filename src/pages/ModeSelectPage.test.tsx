import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { ModeSelectPage } from './ModeSelectPage'

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/flashcards/standard/cat-1']}>
      <Routes>
        <Route path="/flashcards/:deckType/:categoryId" element={<ModeSelectPage />} />
        <Route path="/flashcards/:deckType/:categoryId/practice" element={<div>Practice page</div>} />
        <Route path="/flashcards/:deckType/:categoryId/ten-cards" element={<div>Ten Cards page</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('ModeSelectPage', () => {
  it('renders Practice and 10 Cards buttons', () => {
    renderPage()

    expect(screen.getByRole('button', { name: 'Practice' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '10 Cards' })).toBeInTheDocument()
  })

  it('navigates to the practice route for the category', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: 'Practice' }))

    expect(await screen.findByText('Practice page')).toBeInTheDocument()
  })

  it('navigates to the ten-cards route for the category', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: '10 Cards' }))

    expect(await screen.findByText('Ten Cards page')).toBeInTheDocument()
  })

  it('shows an error instead of mode buttons for an unrecognized deckType', () => {
    render(
      <MemoryRouter initialEntries={['/flashcards/bogus/cat-1']}>
        <Routes>
          <Route path="/flashcards/:deckType/:categoryId" element={<ModeSelectPage />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText(/no category selected/i)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Practice' })).not.toBeInTheDocument()
  })
})
