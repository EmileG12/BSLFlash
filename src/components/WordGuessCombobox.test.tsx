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

  it('shows only the word in the list, with the definition appearing as a tooltip on hover', async () => {
    const user = userEvent.setup()

    render(<WordGuessCombobox words={words} onSubmit={vi.fn()} />)

    await user.click(screen.getByRole('combobox'))
    const option = await screen.findByRole('option', { name: 'Hello' })

    expect(screen.queryByText('A greeting.')).not.toBeInTheDocument()

    await user.hover(option)
    expect(await screen.findByText('A greeting.')).toBeVisible()
  })

  it('enables Confirm once a word is selected and submits its id on click', async () => {
    const onSubmit = vi.fn()
    const user = userEvent.setup()

    render(<WordGuessCombobox words={words} onSubmit={onSubmit} />)

    await user.click(screen.getByRole('combobox'))
    await user.click(await screen.findByRole('option', { name: 'Hello' }))

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

    expect(await screen.findByRole('option', { name: 'World' })).toBeInTheDocument()
    expect(screen.queryByRole('option', { name: 'Hello' })).not.toBeInTheDocument()
  })

  it('submits via a second Enter press after selecting a word', async () => {
    const onSubmit = vi.fn()
    const user = userEvent.setup()

    render(<WordGuessCombobox words={words} onSubmit={onSubmit} />)

    await user.click(screen.getByRole('combobox'))
    await user.click(await screen.findByRole('option', { name: 'World' }))
    expect(onSubmit).not.toHaveBeenCalled()

    await user.keyboard('{Enter}')
    expect(onSubmit).toHaveBeenCalledWith('2')
  })

  it('stages the top filtered match on Enter, same as clicking it', async () => {
    const onSubmit = vi.fn()
    const user = userEvent.setup()

    render(<WordGuessCombobox words={words} onSubmit={onSubmit} />)

    await user.click(screen.getByRole('combobox'))
    await user.type(screen.getByRole('combobox'), 'World')
    await user.keyboard('{Enter}')

    expect(screen.getByRole('combobox')).toHaveValue('World')
    expect(onSubmit).not.toHaveBeenCalled()

    const confirmButton = screen.getByRole('button', { name: /confirm/i })
    expect(confirmButton).toBeEnabled()
    await user.click(confirmButton)
    expect(onSubmit).toHaveBeenCalledWith('2')
  })

  it('clears the box on Enter when no options match', async () => {
    const user = userEvent.setup()

    render(<WordGuessCombobox words={words} onSubmit={vi.fn()} />)

    await user.click(screen.getByRole('combobox'))
    await user.type(screen.getByRole('combobox'), 'nonexistent')
    await user.keyboard('{Enter}')

    expect(screen.getByRole('combobox')).toHaveValue('')
    expect(screen.getByRole('button', { name: /confirm/i })).toBeDisabled()
  })
})
