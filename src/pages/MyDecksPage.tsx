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
import { useCustomCategories } from '../hooks/useCustomCategories'
import { supabase } from '../lib/supabase'
import { DeckGrid, type DeckGridItem } from '../components/DeckGrid'

export function MyDecksPage() {
  const { customCategories, loading, error } = useCustomCategories()
  const [deleted, setDeleted] = useState<Set<string>>(new Set())
  const [pendingDelete, setPendingDelete] = useState<DeckGridItem | null>(null)
  const [deleting, setDeleting] = useState(false)
  const navigate = useNavigate()

  const visibleCategories = customCategories.filter((category) => !deleted.has(category.id))

  async function handleConfirmDelete() {
    if (!pendingDelete) return
    setDeleting(true)
    const { error } = await supabase
      .from('custom_categories')
      .delete()
      .eq('id', pendingDelete.id)
    setDeleting(false)
    if (!error) {
      setDeleted((previous) => new Set(previous).add(pendingDelete.id))
      setPendingDelete(null)
    }
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 p-4">
      <DeckGrid
        title="My Decks"
        items={visibleCategories.map((category) => ({
          id: category.id,
          name: category.category_name,
        }))}
        loading={loading}
        error={error}
        emptyMessage="You haven't created any decks yet."
        onSelect={(id) => navigate(`/flashcards/custom/${id}`)}
        onDelete={(item) => setPendingDelete(item)}
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
    </div>
  )
}
