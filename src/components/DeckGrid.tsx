import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import './SelectDeckCard.css'

export interface DeckGridItem {
  id: string
  name: string
}

interface DeckGridProps {
  title: string
  items: DeckGridItem[]
  loading: boolean
  error: string | null
  emptyMessage: string
  onSelect: (id: string) => void
}

/** Presentational card listing decks as buttons; clicking one hands its id to onSelect. Shared by SelectDeckCard (standard categories) and MyDecksPage (custom decks) so the two don't duplicate this markup. */
export function DeckGrid({ title, items, loading, error, emptyMessage, onSelect }: DeckGridProps) {
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
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        ) : (
          <div className="select-deck-grid">
            {items.map((item) => (
              <Button
                key={item.id}
                variant="outline"
                className="select-deck-button"
                onClick={() => onSelect(item.id)}
              >
                {item.name}
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
