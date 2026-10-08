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
import { X } from 'lucide-react'
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
      <Card className="h-[75vh] w-full pt-0 shadow-lg">
        <CardHeader className="relative z-10 rounded-t-xl border-b border-brand bg-brand-strong py-(--card-spacing) shadow-lg">
          <CardTitle className="text-2xl text-brand-muted">Create a deck</CardTitle>
          <CardDescription className="text-brand-muted/80">
            Pick words from the list on the left to add them to your deck on the right. Remove any
            you don't want, then confirm to name and save it.
          </CardDescription>
        </CardHeader>
        <CardContent className="-mt-(--card-spacing) -mb-(--card-spacing) grid min-h-0 flex-1 grid-cols-2 gap-0 px-0">
          <div className="flex min-h-0 flex-col gap-2 px-(--card-spacing) pt-(--card-spacing)">
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
                    className="justify-start"
                    onClick={() => handleAdd(word.id)}
                  >
                    {word.word}
                  </Button>
                ))
              )}
            </div>
          </div>

          <div className="relative flex min-h-0 flex-col gap-2 border-l border-brand bg-brand-muted px-(--card-spacing) py-(--card-spacing)">
            <div className="mb-10 flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto rounded-lg p-1">
              {selectedWords.length === 0 ? (
                <p className="p-2 text-sm text-brand/70">
                  Select words from the left to add them here.
                </p>
              ) : (
                selectedWords.map((word) => (
                  <div
                    key={word.id}
                    className="flex items-center justify-between rounded-md px-2.5 py-1 text-sm text-brand"
                  >
                    {word.word}
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Remove ${word.word}`}
                      onClick={() => handleRemove(word.id)}
                    >
                      <X />
                    </Button>
                  </div>
                ))
              )}
            </div>
            <p className="absolute bottom-(--card-spacing) left-(--card-spacing) bg-brand-muted pr-2 text-left text-sm font-medium">
              <span className="text-brand-foreground">Total: </span>
              <span className="text-brand">{selectedWords.length}</span>
            </p>
          </div>
        </CardContent>
        <CardFooter className="justify-end bg-brand-foreground">
          <Button
            className="bg-success text-primary-foreground hover:bg-success/80"
            disabled={selectedWords.length === 0}
            onClick={() => setNameDialogOpen(true)}
          >
            Confirm
          </Button>
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
