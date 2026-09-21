import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { HomePage } from './HomePage'

vi.mock('../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}))

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}))

function mockCategoriesByVocabulary() {
  vi.mocked(supabase.from).mockReturnValue({
    select: vi.fn().mockReturnValue({
      eq: vi.fn((_column: string, isVocabulary: boolean) => ({
        order: vi.fn().mockResolvedValue({
          data: isVocabulary
            ? [{ id: 'gcse-1', category_name: 'GCSE', is_vocabulary: true }]
            : [{ id: 'topic-1', category_name: 'Greetings', is_vocabulary: false }],
          error: null,
        }),
      })),
    }),
  } as never)
}

describe('HomePage', () => {
  it('greets the user by email', () => {
    vi.mocked(useAuth).mockReturnValue({
      session: { user: { email: 'user@example.com' } },
      loading: false,
    } as never)
    mockCategoriesByVocabulary()

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    )

    expect(screen.getByText(/welcome, user@example\.com/i)).toBeInTheDocument()
  })

  it('renders the topic deck picker above the vocabulary deck picker, each with its own categories', async () => {
    vi.mocked(useAuth).mockReturnValue({ session: null, loading: false } as never)
    mockCategoriesByVocabulary()

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    )

    const titles = screen.getAllByText(/select a/i)
    expect(titles[0]).toHaveTextContent('Select a deck')
    expect(titles[1]).toHaveTextContent('Select a vocabulary list')

    expect(await screen.findByRole('button', { name: 'Greetings' })).toBeInTheDocument()
    expect(await screen.findByRole('button', { name: 'GCSE' })).toBeInTheDocument()
  })
})
