import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, X } from 'lucide-react'
import type { WordOption } from '../hooks/useWords'

interface WordPickerProps {
  words: WordOption[]
  loading: boolean
  error: string | null
  selectedIds: string[]
  onAdd: (id: string) => void
  onRemove: (id: string) => void
}

/** Two-column word catalog / selected-words picker, shared by CreateDeckPage and EditDeckModal so neither duplicates this markup. */
export function WordPicker({ words, loading, error, selectedIds, onAdd, onRemove }: WordPickerProps) {
  const [search, setSearch] = useState('')

  const wordsById = useMemo(() => new Map(words.map((word) => [word.id, word])), [words])
  const selectedWords = selectedIds
    .map((id) => wordsById.get(id))
    .filter((word) => word !== undefined)

  const availableWords = words.filter(
    (word) =>
      !selectedIds.includes(word.id) && word.word.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <>
      <div
        role="group"
        className="flex max-h-[40vh] min-h-0 flex-col gap-2 px-(--card-spacing) pt-(--card-spacing) md:max-h-none"
        aria-label="Word catalog"
      >
        <Input
          placeholder="Search words..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto rounded-lg bg-card p-1">
          {loading ? (
            <p className="p-2 text-sm text-muted-foreground">Loading words...</p>
          ) : error ? (
            <p className="p-2 text-sm text-destructive">Failed to load words: {error}</p>
          ) : availableWords.length === 0 ? (
            <p className="p-2 text-sm text-muted-foreground">No words match your search.</p>
          ) : (
            availableWords.map((word) => (
              <Button
                key={word.id}
                variant="ghost"
                className="min-h-11 justify-start"
                onClick={() => onAdd(word.id)}
              >
                <Plus aria-hidden="true" className="size-4 text-muted-foreground" />
                {word.word}
              </Button>
            ))
          )}
        </div>
      </div>

      <div
        role="group"
        className="flex max-h-[40vh] min-h-0 flex-col gap-2 border-t border-brand bg-brand-muted px-(--card-spacing) py-(--card-spacing) md:max-h-none md:border-t-0 md:border-l"
        aria-label="Selected words"
      >
        <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto rounded-lg p-1">
          {selectedWords.length === 0 ? (
            <p className="p-2 text-sm text-muted-foreground">
              Select words from the left to add them here.
            </p>
          ) : (
            selectedWords.map((word) => (
              <div
                key={word.id}
                className="flex items-center justify-between rounded-md px-2.5 py-1 text-sm text-foreground"
              >
                {word.word}
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="size-11"
                  aria-label={`Remove ${word.word}`}
                  onClick={() => onRemove(word.id)}
                >
                  <X />
                </Button>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  )
}
