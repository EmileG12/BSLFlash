import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { supabase } from '../lib/supabase'
import { HomePage } from './HomePage'

vi.mock('../lib/supabase', () => ({
  supabase: {
    rpc: vi.fn(),
  },
}))

function mockCategoriesByVocabulary() {
  vi.mocked(supabase.rpc).mockImplementation(((_fn: string, args: { p_is_vocabulary: boolean }) =>
    Promise.resolve({
      data: args.p_is_vocabulary
        ? [{ id: 'gcse-1', category_name: 'GCSE', is_vocabulary: true }]
        : [{ id: 'topic-1', category_name: 'Greetings', is_vocabulary: false }],
      error: null,
    })) as never)
}

describe('HomePage', () => {
  it('renders the topic deck picker above the vocabulary deck picker, each with its own categories', async () => {
    mockCategoriesByVocabulary()

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    )

    const topicsTitle = screen.getByText('Everyday topics')
    const qualificationTitle = screen.getByText('Exam & qualification lists')
    expect(topicsTitle.compareDocumentPosition(qualificationTitle) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()

    expect(await screen.findByRole('button', { name: 'Greetings' })).toBeInTheDocument()
    expect(await screen.findByRole('button', { name: 'GCSE' })).toBeInTheDocument()
  })
})
