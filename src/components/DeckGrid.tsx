import type { ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CircleAlert, Inbox, Trash2 } from 'lucide-react'
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
  /** Icon shown in a brand-muted circle beside the title. */
  icon?: ReactNode
  /** One-line description shown under the title. */
  subtitle?: string
  /** 'card' (default) wraps itself in a Card, matching MyDecksPage's standalone use. 'bare' renders the same header/content without the Card chrome, for a caller that provides its own surrounding Card (e.g. HomePage, where two DeckGrids share one Card). */
  variant?: 'card' | 'bare'
}

/** Presentational list of decks as buttons; clicking one hands its id to onSelect. Shared by SelectDeckCard (standard categories) and MyDecksPage (custom decks) so the two don't duplicate this markup. */
export function DeckGrid({
  title,
  items,
  loading,
  error,
  emptyMessage,
  onSelect,
  onDelete,
  icon,
  subtitle,
  variant = 'card',
}: DeckGridProps) {
  const header = (
    <div className="flex items-center gap-3">
      {icon && (
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-muted text-brand">
          {icon}
        </span>
      )}
      <div>
        <CardTitle className={variant === 'bare' ? 'text-lg font-semibold' : 'text-2xl'}>
          {title}
        </CardTitle>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>
    </div>
  )

  const content = (
    <>
      {loading ? (
        <div className="select-deck-grid" aria-hidden="true">
          <span className="sr-only">Loading categories...</span>
          {[0, 1, 2].map((placeholder) => (
            <div key={placeholder} className="h-8 rounded-lg bg-muted motion-safe:animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <p className="flex items-center gap-2 text-sm text-destructive">
          <CircleAlert className="size-4" />
          Failed to load categories: {error}
        </p>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-8 text-sm text-muted-foreground">
          <Inbox className="size-6" />
          <p>{emptyMessage}</p>
        </div>
      ) : (
        <div className="select-deck-grid">
          {items.map((item) => (
            <div key={item.id} className="flex items-stretch gap-2">
              <Button
                variant="outline"
                className="select-deck-button flex-1"
                onClick={() => onSelect(item.id)}
              >
                {item.name}
              </Button>
              {onDelete && (
                <div className="flex items-center border-l border-border pl-2">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Delete ${item.name}`}
                    onClick={() => onDelete(item)}
                  >
                    <Trash2 />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  )

  if (variant === 'bare') {
    return (
      <div className="flex flex-col gap-4">
        {header}
        {content}
      </div>
    )
  }

  return (
    <Card className="select-deck-card">
      <CardHeader>{header}</CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  )
}
