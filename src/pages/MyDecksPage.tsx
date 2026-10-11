import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useCustomDecks } from '../hooks/useCustomDecks'
import { useSavedDecks } from '../hooks/useSavedDecks'
import { supabase } from '../lib/supabase'
import { DeckGrid, type DeckGridItem } from '../components/DeckGrid'
import { EditDeckModal } from '../components/EditDeckModal'

export function MyDecksPage() {
  const { customDecks, loading, error, setCustomDecks } = useCustomDecks()
  const { savedDecks, loading: savedLoading, error: savedError, setSavedDecks } = useSavedDecks()
  const [deleted, setDeleted] = useState<Set<string>>(new Set())
  const [pendingDelete, setPendingDelete] = useState<DeckGridItem | null>(null)
  const [pendingUnsave, setPendingUnsave] = useState<DeckGridItem | null>(null)
  const [editingDeckId, setEditingDeckId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [unsaving, setUnsaving] = useState(false)
  const navigate = useNavigate()

  const visibleDecks = customDecks.filter((deck) => !deleted.has(deck.id))

  async function handleConfirmDelete() {
    if (!pendingDelete) return
    setDeleting(true)
    const { error } = await supabase
      .from('custom_decks')
      .delete()
      .eq('id', pendingDelete.id)
    setDeleting(false)
    if (!error) {
      setDeleted((previous) => new Set(previous).add(pendingDelete.id))
      setPendingDelete(null)
    }
  }

  async function handleConfirmUnsave() {
    if (!pendingUnsave) return
    setUnsaving(true)
    const { error } = await supabase
      .from('saved_decks')
      .delete()
      .eq('custom_deck_id', pendingUnsave.id)
    setUnsaving(false)
    if (!error) {
      setSavedDecks((previous) => previous.filter((deck) => deck.id !== pendingUnsave.id))
      setPendingUnsave(null)
    }
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 p-4">
      <DeckGrid
        title="My Decks"
        items={visibleDecks.map((deck) => ({
          id: deck.id,
          name: deck.deck_name,
        }))}
        loading={loading}
        error={error}
        emptyMessage="You haven't created any decks yet."
        onSelect={(id) => navigate(`/flashcards/custom/${id}`)}
        onDelete={(item) => setPendingDelete(item)}
        onEdit={(item) => setEditingDeckId(item.id)}
      />

      <DeckGrid
        title="Saved Decks"
        subtitle="Decks you've added from the Browse decks directory."
        items={savedDecks.map((deck) => ({
          id: deck.id,
          name: deck.owner_name ? `${deck.deck_name} — by ${deck.owner_name}` : deck.deck_name,
        }))}
        loading={savedLoading}
        error={savedError}
        emptyMessage="You haven't saved any decks yet. Browse the directory to find some."
        onSelect={(id) => navigate(`/flashcards/custom/${id}`)}
        onDelete={(item) => setPendingUnsave(item)}
        deleteActionLabel="Remove"
      />

      <Dialog open={pendingDelete !== null} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete "{pendingDelete?.name}"?</DialogTitle>
            <DialogDescription>This can't be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingDelete(null)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete} disabled={deleting}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={pendingUnsave !== null} onOpenChange={(open) => !open && setPendingUnsave(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove "{pendingUnsave?.name}" from My Decks?</DialogTitle>
            <DialogDescription>
              You can add it back later from the Browse decks directory.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingUnsave(null)} disabled={unsaving}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmUnsave} disabled={unsaving}>
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {editingDeckId && (
        <EditDeckModal
          deckId={editingDeckId}
          onClose={() => setEditingDeckId(null)}
          onSaved={(deckId, deckName) =>
            setCustomDecks((previous) =>
              previous.map((deck) => (deck.id === deckId ? { ...deck, deck_name: deckName } : deck)),
            )
          }
        />
      )}
    </div>
  )
}
