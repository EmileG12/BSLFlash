import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Plus, X } from 'lucide-react'
import { useWords } from '../hooks/useWords'
import { supabase } from '../lib/supabase'

export function CreateDeckPage() {
  const { words, loading, error } = useWords()
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [nameDialogOpen, setNameDialogOpen] = useState(false)
  const [deckName, setDeckName] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const navigate = useNavigate()

  const wordsById = useMemo(() => new Map(words.map((word) => [word.id, word])), [words])
  const selectedWords = selectedIds
    .map((id) => wordsById.get(id))
    .filter((word) => word !== undefined)

  const availableWords = words.filter(
    (word) =>
      !selectedIds.includes(word.id) && word.word.toLowerCase().includes(search.toLowerCase()),
  )

  function handleAdd(id: string) {
    setSelectedIds((previous) => [...previous, id])
  }

  function handleRemove(id: string) {
    setSelectedIds((previous) => previous.filter((existingId) => existingId !== id))
  }

  async function handleCreateDeck() {
    if (deckName.trim() === '') return
    setSaving(true)
    setSaveError(null)
    const { error } = await supabase.rpc('create_custom_category', {
      p_name: deckName.trim(),
      p_word_ids: selectedIds,
    })
    setSaving(false)
    if (error) {
      setSaveError(error.message)
      return
    }
    navigate('/my-decks')
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4 p-4">
      <Card className="h-auto w-full shadow-lg md:h-[75vh]">
        <CardHeader className="-mt-(--card-spacing) border-b border-brand bg-muted pt-(--card-spacing)">
          <CardTitle className="text-2xl">Create a deck</CardTitle>
          <CardDescription>
            Pick words from the list on the left to add them to your deck on the right. Remove any
            you don't want, then confirm to name and save it.
          </CardDescription>
        </CardHeader>
        <CardContent className="-mt-(--card-spacing) grid min-h-0 flex-1 grid-cols-1 gap-4 px-0 md:grid-cols-2 md:gap-0">
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
                    onClick={() => handleAdd(word.id)}
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
                      onClick={() => handleRemove(word.id)}
                    >
                      <X />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="-mt-(--card-spacing) grid grid-cols-1 gap-0 border-t-0 bg-card p-0 md:grid-cols-2">
          <div className="hidden md:block" />
          <div className="flex items-center justify-between gap-2 border-t border-brand bg-brand-muted px-(--card-spacing) py-(--card-spacing) md:border-l">
            <span
              role="status"
              aria-live="polite"
              aria-atomic="true"
              className="text-sm font-medium text-foreground"
            >
              {selectedWords.length} word{selectedWords.length === 1 ? '' : 's'} selected
            </span>
            <Button
              className="bg-success text-primary-foreground hover:bg-success/80"
              disabled={selectedWords.length === 0}
              onClick={() => setNameDialogOpen(true)}
            >
              Confirm
            </Button>
          </div>
        </CardFooter>
      </Card>

      <Dialog open={nameDialogOpen} onOpenChange={setNameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Name your deck</DialogTitle>
            <DialogDescription>
              Give this deck a name so you can find it later in My Decks.
            </DialogDescription>
          </DialogHeader>
          <Input
            placeholder="Deck name"
            value={deckName}
            onChange={(event) => setDeckName(event.target.value)}
            autoFocus
          />
          {saveError && <p className="text-sm text-destructive">{saveError}</p>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setNameDialogOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleCreateDeck} disabled={saving || deckName.trim() === ''}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
