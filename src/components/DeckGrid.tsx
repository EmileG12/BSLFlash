import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
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
  /** When given, each item also gets a trailing delete icon button (a sibling of the select button, not nested inside it). Omit for a plain read-only list like SelectDeckCard's. */
  onDelete?: (item: DeckGridItem) => void
}

/** Presentational card listing decks as buttons; clicking one hands its id to onSelect. Shared by SelectDeckCard (standard categories) and MyDecksPage (custom decks) so the two don't duplicate this markup. */
export function DeckGrid({
  title,
  items,
  loading,
  error,
  emptyMessage,
  onSelect,
  onDelete,
}: DeckGridProps) {
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
              <div key={item.id} className="flex items-stretch gap-1">
                <Button
                  variant="outline"
                  className="select-deck-button flex-1"
                  onClick={() => onSelect(item.id)}
                >
                  {item.name}
                </Button>
                {onDelete && (
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Delete ${item.name}`}
                    onClick={() => onDelete(item)}
                  >
                    <Trash2 />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
