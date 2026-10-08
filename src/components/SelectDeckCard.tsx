import { useNavigate } from 'react-router-dom'
import { useCategories } from '../hooks/useCategories'
import { DeckGrid } from './DeckGrid'

interface SelectDeckCardProps {
  /** false lists topic categories (Animals, Greetings, ...); true lists vocabulary-requirement categories (e.g. GCSE). */
  vocabulary: boolean
  title?: string
}

/** Card listing flashcard categories (filtered by topic vs. vocabulary-requirement) as buttons; clicking one starts the flashcard game for that category. */
export function SelectDeckCard({ vocabulary, title = 'Select a deck' }: SelectDeckCardProps) {
  const { categories, loading, error } = useCategories(vocabulary)
  const navigate = useNavigate()

  return (
    <DeckGrid
      title={title}
      items={categories.map((category) => ({ id: category.id, name: category.category_name }))}
      loading={loading}
      error={error}
      emptyMessage="No categories yet."
      onSelect={(id) => navigate(`/flashcards/standard/${id}`)}
    />
  )
}
