import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Bookmark, BookmarkCheck, CircleAlert, Heart, Inbox } from 'lucide-react'
import { cn } from '@/lib/utils'
import { usePublicDecks, type DeckSort } from '../hooks/usePublicDecks'
import { TagFilterChips } from '../components/TagFilterChips'
import { supabase } from '../lib/supabase'

const SORT_OPTIONS: { value: DeckSort; label: string }[] = [
  { value: 'likes', label: 'Most liked' },
  { value: 'newest', label: 'Newest' },
  { value: 'name', label: 'Name' },
]

export function BrowseDecksPage() {
  const [search, setSearch] = useState('')
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
  const [sort, setSort] = useState<DeckSort>('likes')
  const { decks, loading, error, setDecks } = usePublicDecks(search, selectedTagIds, sort)
  const navigate = useNavigate()

  function toggleTag(id: string) {
    setSelectedTagIds((previous) =>
      previous.includes(id) ? previous.filter((existing) => existing !== id) : [...previous, id],
    )
  }

  async function toggleLike(deckId: string, currentlyLiked: boolean) {
    setDecks((previous) =>
      previous.map((deck) =>
        deck.id === deckId
          ? {
              ...deck,
              liked_by_me: !currentlyLiked,
              like_count: deck.like_count + (currentlyLiked ? -1 : 1),
            }
          : deck,
      ),
    )
    const { error } = currentlyLiked
      ? await supabase.from('deck_likes').delete().eq('custom_deck_id', deckId)
      : await supabase.from('deck_likes').insert({ custom_deck_id: deckId })
    if (error) {
      setDecks((previous) =>
        previous.map((deck) =>
          deck.id === deckId
            ? { ...deck, liked_by_me: currentlyLiked, like_count: deck.like_count + (currentlyLiked ? 1 : -1) }
            : deck,
        ),
      )
    }
  }

  async function toggleSave(deckId: string, currentlySaved: boolean) {
    setDecks((previous) =>
      previous.map((deck) => (deck.id === deckId ? { ...deck, saved_by_me: !currentlySaved } : deck)),
    )
    const { error } = currentlySaved
      ? await supabase.from('saved_decks').delete().eq('custom_deck_id', deckId)
      : await supabase.from('saved_decks').insert({ custom_deck_id: deckId })
    if (error) {
      setDecks((previous) =>
        previous.map((deck) => (deck.id === deckId ? { ...deck, saved_by_me: currentlySaved } : deck)),
      )
    }
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 p-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Browse decks</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Input
              placeholder="Search decks by name..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="sm:flex-1"
            />
            <div role="group" aria-label="Sort decks by" className="flex gap-1">
              {SORT_OPTIONS.map((option) => (
                <Button
                  key={option.value}
                  type="button"
                  variant={sort === option.value ? 'default' : 'outline'}
                  size="sm"
                  aria-pressed={sort === option.value}
                  onClick={() => setSort(option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          <TagFilterChips selectedIds={selectedTagIds} onToggle={toggleTag} />

          {loading ? (
            <div aria-hidden="true" className="flex flex-col gap-2">
              <span className="sr-only">Loading decks...</span>
              {[0, 1, 2].map((placeholder) => (
                <div key={placeholder} className="h-16 rounded-lg bg-muted motion-safe:animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <p className="flex items-center gap-2 text-sm text-destructive">
              <CircleAlert className="size-4" />
              Failed to load decks: {error}
            </p>
          ) : decks.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-sm text-muted-foreground">
              <Inbox className="size-6" />
              <p>No public decks match your search.</p>
            </div>
          ) : (
            <ul className="flex flex-col gap-2">
              {decks.map((deck) => (
                <li
                  key={deck.id}
                  className="flex flex-col gap-2 rounded-lg border border-border bg-card p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <button
                    type="button"
                    className="flex flex-1 flex-col items-start gap-1 text-left"
                    onClick={() => navigate(`/flashcards/custom/${deck.id}`)}
                  >
                    <span className="font-medium text-foreground">{deck.deck_name}</span>
                    <span className="text-xs text-muted-foreground">
                      by {deck.owner_name ?? 'Anonymous'}
                      {deck.tag_names.length > 0 && <> · {deck.tag_names.join(', ')}</>}
                    </span>
                  </button>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-pressed={deck.liked_by_me}
                      aria-label={deck.liked_by_me ? `Unlike ${deck.deck_name}` : `Like ${deck.deck_name}`}
                      onClick={() => toggleLike(deck.id, deck.liked_by_me)}
                      className="gap-1"
                    >
                      <Heart
                        className={cn('size-4', deck.liked_by_me && 'fill-current text-destructive')}
                      />
                      {deck.like_count}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-pressed={deck.saved_by_me}
                      aria-label={
                        deck.saved_by_me ? `Remove ${deck.deck_name} from My Decks` : `Add ${deck.deck_name} to My Decks`
                      }
                      onClick={() => toggleSave(deck.id, deck.saved_by_me)}
                    >
                      {deck.saved_by_me ? <BookmarkCheck /> : <Bookmark />}
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
