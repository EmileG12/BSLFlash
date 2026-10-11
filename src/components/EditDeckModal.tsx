import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useWords } from '../hooks/useWords'
import { useCustomDeckDetail, type CustomDeckDetail } from '../hooks/useCustomDeckDetail'
import { WordPicker } from './WordPicker'
import { TagPicker } from './TagPicker'
import { supabase } from '../lib/supabase'

interface EditDeckModalProps {
  deckId: string
  onClose: () => void
  /** Called after a successful save with the deck's (possibly renamed) name, so the caller can update its own list without a full refetch. */
  onSaved: (deckId: string, deckName: string) => void
}

interface EditDeckFormProps {
  deckId: string
  detail: CustomDeckDetail
  onClose: () => void
  onSaved: (deckId: string, deckName: string) => void
}

/** The actual editable form, only mounted once `detail` has loaded -- its local state is seeded from `detail` via lazy useState initializers rather than an effect, since `detail` is fixed for this component's lifetime (one fetch per deckId, and EditDeckModal mounts fresh per deckId). */
function EditDeckForm({ deckId, detail, onClose, onSaved }: EditDeckFormProps) {
  const { words, loading: wordsLoading, error: wordsError } = useWords()

  const [deckName, setDeckName] = useState(detail.deckName)
  const [selectedWordIds, setSelectedWordIds] = useState<string[]>(detail.wordIds)
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(detail.tagIds)
  const [isPublic, setIsPublic] = useState(detail.isPublic)
  const [publishError, setPublishError] = useState<string | null>(null)
  const [publishing, setPublishing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  function handleAddWord(id: string) {
    setSelectedWordIds((previous) => [...previous, id])
  }

  function handleRemoveWord(id: string) {
    setSelectedWordIds((previous) => previous.filter((existingId) => existingId !== id))
  }

  function handleToggleTag(id: string) {
    setSelectedTagIds((previous) =>
      previous.includes(id) ? previous.filter((existingId) => existingId !== id) : [...previous, id],
    )
  }

  async function handleTogglePublish() {
    const next = !isPublic
    setPublishing(true)
    setPublishError(null)
    const { error } = await supabase.rpc('set_custom_deck_public', {
      p_deck_id: deckId,
      p_is_public: next,
    })
    setPublishing(false)
    if (error) {
      setPublishError(error.message)
      return
    }
    setIsPublic(next)
  }

  async function handleSave() {
    if (deckName.trim() === '' || selectedWordIds.length === 0) return
    setSaving(true)
    setSaveError(null)

    const { error: updateError } = await supabase.rpc('update_custom_deck', {
      p_deck_id: deckId,
      p_name: deckName.trim(),
      p_word_ids: selectedWordIds,
    })
    if (updateError) {
      setSaving(false)
      setSaveError(updateError.message)
      return
    }

    const removedTagIds = detail.tagIds.filter((id) => !selectedTagIds.includes(id))
    const addedTagIds = selectedTagIds.filter((id) => !detail.tagIds.includes(id))

    if (removedTagIds.length > 0) {
      const { error } = await supabase
        .from('custom_deck_tags')
        .delete()
        .eq('custom_deck_id', deckId)
        .in('category_id', removedTagIds)
      if (error) {
        setSaving(false)
        setSaveError(error.message)
        return
      }
    }

    if (addedTagIds.length > 0) {
      const { error } = await supabase
        .from('custom_deck_tags')
        .insert(addedTagIds.map((categoryId) => ({ custom_deck_id: deckId, category_id: categoryId })))
      if (error) {
        setSaving(false)
        setSaveError(error.message)
        return
      }
    }

    setSaving(false)
    onSaved(deckId, deckName.trim())
    onClose()
  }

  const canSave = deckName.trim() !== '' && selectedWordIds.length > 0 && !saving

  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto">
        <Input
          placeholder="Deck name"
          value={deckName}
          onChange={(event) => setDeckName(event.target.value)}
          aria-label="Deck name"
        />

        <div className="flex items-center justify-between gap-2 rounded-lg border border-border p-3">
          <div>
            <p className="text-sm font-medium text-foreground">Published</p>
            <p className="text-xs text-muted-foreground">
              {isPublic
                ? 'Anyone can find and play this deck in Browse decks.'
                : 'Only you can see and play this deck.'}
            </p>
          </div>
          <Button
            type="button"
            variant={isPublic ? 'default' : 'outline'}
            size="sm"
            aria-pressed={isPublic}
            disabled={publishing}
            onClick={handleTogglePublish}
          >
            {isPublic ? 'Published' : 'Unpublished'}
          </Button>
        </div>
        {publishError && <p className="text-sm text-destructive">{publishError}</p>}

        <TagPicker selectedIds={selectedTagIds} onToggle={handleToggleTag} />

        <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 rounded-lg border border-border md:grid-cols-2 md:gap-0">
          <WordPicker
            words={words}
            loading={wordsLoading}
            error={wordsError}
            selectedIds={selectedWordIds}
            onAdd={handleAddWord}
            onRemove={handleRemoveWord}
          />
        </div>
      </div>

      {saveError && <p className="text-sm text-destructive">{saveError}</p>}

      <DialogFooter>
        <Button variant="outline" onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={!canSave}>
          Save
        </Button>
      </DialogFooter>
    </>
  )
}

/** Owner-only edit flow for a custom deck: rename, add/remove words, change tags, toggle publish -- reached from a "Edit deck" button on each deck the current user owns in MyDecksPage. */
export function EditDeckModal({ deckId, onClose, onSaved }: EditDeckModalProps) {
  const { detail, loading, error } = useCustomDeckDetail(deckId)

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex h-auto max-h-[90vh] w-full max-w-4xl flex-col md:h-[80vh]">
        <DialogHeader>
          <DialogTitle>Edit deck</DialogTitle>
          <DialogDescription>
            Rename your deck, add or remove words, change its tags, and publish it to the directory.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <p className="p-2 text-sm text-muted-foreground">Loading deck...</p>
        ) : error || !detail ? (
          <p className="p-2 text-sm text-destructive">Failed to load deck: {error}</p>
        ) : (
          <EditDeckForm deckId={deckId} detail={detail} onClose={onClose} onSaved={onSaved} />
        )}
      </DialogContent>
    </Dialog>
  )
}
