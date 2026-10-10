import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCategories } from '../hooks/useCategories'
import { DeckGrid } from './DeckGrid'

interface SelectDeckCardProps {
  /** false lists topic categories (Animals, Greetings, ...); true lists vocabulary-requirement categories (e.g. GCSE). */
  vocabulary: boolean
  title?: string
  icon?: ReactNode
  subtitle?: string
  /** See DeckGrid's variant prop. Defaults to 'card' for a standalone card like HomePage's previous layout. */
  variant?: 'card' | 'bare'
  /** Case-insensitive filter on category_name. Omit or pass '' to show all. */
  search?: string
}

/** Card (or bare section, see variant) listing flashcard categories (filtered by topic vs. vocabulary-requirement) as buttons; clicking one starts the flashcard game for that category. */
export function SelectDeckCard({
  vocabulary,
  title = 'Select a deck',
  icon,
  subtitle,
  variant,
  search = '',
}: SelectDeckCardProps) {
  const { categories, loading, error } = useCategories(vocabulary)
  const navigate = useNavigate()

  const query = search.trim().toLowerCase()
  const filtered =
    query === ''
      ? categories
      : categories.filter((category) => category.category_name.toLowerCase().includes(query))

  return (
    <DeckGrid
      title={title}
      icon={icon}
      subtitle={subtitle}
      variant={variant}
      items={filtered.map((category) => ({ id: category.id, name: category.category_name }))}
      loading={loading}
      error={error}
      emptyMessage={query === '' ? 'No categories yet.' : `No categories match "${search.trim()}".`}
      onSelect={(id) => navigate(`/flashcards/standard/${id}`)}
    />
  )
}
