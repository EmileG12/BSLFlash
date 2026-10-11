import { useState } from 'react'
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
import { useWords } from '../hooks/useWords'
import { supabase } from '../lib/supabase'
import { WordPicker } from '../components/WordPicker'

export function CreateDeckPage() {
  const { words, loading, error } = useWords()
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [nameDialogOpen, setNameDialogOpen] = useState(false)
  const [deckName, setDeckName] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const navigate = useNavigate()

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
    const { error } = await supabase.rpc('create_custom_deck', {
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
          <WordPicker
            words={words}
            loading={loading}
            error={error}
            selectedIds={selectedIds}
            onAdd={handleAdd}
            onRemove={handleRemove}
          />
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
              {selectedIds.length} word{selectedIds.length === 1 ? '' : 's'} selected
            </span>
            <Button
              className="bg-success text-primary-foreground hover:bg-success/80"
              disabled={selectedIds.length === 0}
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
