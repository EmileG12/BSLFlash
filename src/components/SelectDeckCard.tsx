import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useCategories } from '../hooks/useCategories'
import './SelectDeckCard.css'

/** Card listing every flashcard category as a button; clicking one starts the flashcard game for that category. */
export function SelectDeckCard() {
  const { categories, loading, error } = useCategories()
  const navigate = useNavigate()

  return (
    <Card className="select-deck-card">
      <CardHeader>
        <CardTitle className="text-2xl">Select a deck</CardTitle>
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
