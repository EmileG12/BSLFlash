import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useCategories } from '../hooks/useCategories'
import './SelectDeckCard.css'

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
    <Card className="select-deck-card">
      <CardHeader>
        <CardTitle className="text-2xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading categories...</p>
        ) : error ? (
          <p className="text-sm text-destructive">Failed to load categories: {error}</p>
        ) : categories.length === 0 ? (
          <p className="text-sm text-muted-foreground">No categories yet.</p>
        ) : (
          <div className="select-deck-grid">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant="outline"
                className="select-deck-button"
                onClick={() => navigate(`/flashcards/${category.id}`)}
              >
                {category.category_name}
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
