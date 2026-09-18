import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { WordGuessCombobox } from './WordGuessCombobox'
import type { WordOption } from '../hooks/useWords'

const words: WordOption[] = [
  { id: '1', word: 'Hello', definition: 'A greeting.' },
  { id: '2', word: 'World', definition: 'The earth.' },
]

describe('WordGuessCombobox', () => {
  it('disables Confirm until a word is selected', () => {
    render(<WordGuessCombobox words={words} onSubmit={vi.fn()} />)

    expect(screen.getByRole('button', { name: /confirm/i })).toBeDisabled()
  })

  it('enables Confirm once a word is selected and submits its id on click', async () => {
    const onSubmit = vi.fn()
    const user = userEvent.setup()

    render(<WordGuessCombobox words={words} onSubmit={onSubmit} />)

    await user.click(screen.getByRole('combobox'))
    await user.click(await screen.findByText(/hello — a greeting/i))

    const confirmButton = screen.getByRole('button', { name: /confirm/i })
    expect(confirmButton).toBeEnabled()

    await user.click(confirmButton)
    expect(onSubmit).toHaveBeenCalledWith('1')
  })

  it('filters the list as the user types', async () => {
    const user = userEvent.setup()

    render(<WordGuessCombobox words={words} onSubmit={vi.fn()} />)

    await user.click(screen.getByRole('combobox'))
    await user.type(screen.getByRole('combobox'), 'World')

    expect(await screen.findByText(/world — the earth/i)).toBeInTheDocument()
    expect(screen.queryByText(/hello — a greeting/i)).not.toBeInTheDocument()
  })

  it('submits via a second Enter press after selecting a word', async () => {
    const onSubmit = vi.fn()
    const user = userEvent.setup()

    render(<WordGuessCombobox words={words} onSubmit={onSubmit} />)

    await user.click(screen.getByRole('combobox'))
    await user.click(await screen.findByText(/world — the earth/i))
    expect(onSubmit).not.toHaveBeenCalled()

    await user.keyboard('{Enter}')
    expect(onSubmit).toHaveBeenCalledWith('2')
  })
})
