import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Plus, Star, Video } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { useWordVariants, type WordVariant } from '../hooks/useWordVariants'
import { supabase } from '../lib/supabase'
import { uploadSignVideo } from '../lib/signVideoUpload'

function formatDuration(durationMs: number): string {
  const totalSeconds = Math.round(durationMs / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

function AddVideoDialog({
  variant,
  open,
  onOpenChange,
  onAdded,
}: {
  variant: WordVariant
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdded: (video: WordVariant['sign_videos'][number]) => void
}) {
  const [file, setFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit() {
    if (!file) return
    setSaving(true)
    setError(null)
    try {
      const video = await uploadSignVideo(variant.id, file)
      onAdded(video)
      setFile(null)
      onOpenChange(false)
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Failed to add video.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add video to "{variant.variant_name}"</DialogTitle>
          <DialogDescription>Quizzing picks a random video from this variant's pool.</DialogDescription>
        </DialogHeader>
        <Input
          type="file"
          accept="video/mp4,video/webm"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
        />
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={saving || !file}>
            {saving ? 'Adding…' : 'Add video'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function AddVariantDialog({
  wordId,
  open,
  onOpenChange,
  onAdded,
}: {
  wordId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdded: (variant: WordVariant) => void
}) {
  const [variantName, setVariantName] = useState('')
  const [region, setRegion] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit() {
    const trimmedName = variantName.trim()
    if (trimmedName === '' || !file) return
    setSaving(true)
    setError(null)
    try {
      const { data: newSign, error: signError } = await supabase
        .from('signs')
        .insert({ word_id: wordId, variant_name: trimmedName, region: region.trim() || null })
        .select('id, variant_name, region, is_primary')
        .single()
      if (signError) throw signError

      const video = await uploadSignVideo(newSign.id, file)
      onAdded({ ...newSign, sign_videos: [video] })
      setVariantName('')
      setRegion('')
      setFile(null)
      onOpenChange(false)
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Failed to add variant.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a new variant</DialogTitle>
          <DialogDescription>A variant needs its first video before it can be saved.</DialogDescription>
        </DialogHeader>
        <Input
          placeholder="Variant name"
          value={variantName}
          onChange={(event) => setVariantName(event.target.value)}
        />
        <Input
          placeholder="Region (optional)"
          value={region}
          onChange={(event) => setRegion(event.target.value)}
        />
        <Input
          type="file"
          accept="video/mp4,video/webm"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
        />
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={saving || variantName.trim() === '' || !file}>
            {saving ? 'Adding…' : 'Add variant'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function SuperadminWordEditPage() {
  const { wordId } = useParams<{ wordId: string }>()
  const { variants, loading, error, setVariants } = useWordVariants(wordId ?? '')

  const [word, setWord] = useState('')
  const [definition, setDefinition] = useState('')
  const [wordLoading, setWordLoading] = useState(true)
  const [wordError, setWordError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const [primaryError, setPrimaryError] = useState<string | null>(null)
  const [addVideoTarget, setAddVideoTarget] = useState<WordVariant | null>(null)
  const [addVariantOpen, setAddVariantOpen] = useState(false)

  useEffect(() => {
    if (!wordId) return
    let cancelled = false

    supabase
      .from('words')
      .select('word, definition')
      .eq('id', wordId)
      .single()
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) {
          setWordError(error.message)
        } else {
          setWord(data.word)
          setDefinition(data.definition)
        }
        setWordLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [wordId])

  async function handleSaveWord() {
    if (!wordId) return
    setSaving(true)
    setSaveError(null)
    const { error } = await supabase
      .from('words')
      .update({ word: word.trim(), definition: definition.trim() })
      .eq('id', wordId)
    setSaving(false)
    if (error) setSaveError(error.message)
  }

  async function handleMakePrimary(variant: WordVariant) {
    if (variant.is_primary) return
    setPrimaryError(null)
    const previousVariants = variants
    setVariants((current) =>
      current.map((item) => ({ ...item, is_primary: item.id === variant.id })),
    )
    const { error } = await supabase.rpc('set_primary_sign', { p_sign_id: variant.id })
    if (error) {
      setVariants(previousVariants)
      setPrimaryError(error.message)
    }
  }

  if (!wordId) return null

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4 p-4">
      <Link to="/superadmin/words" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:underline">
        <ArrowLeft aria-hidden="true" className="size-4" />
        Back to Manage Words
      </Link>

      {wordLoading && <p className="text-sm text-muted-foreground">Loading word…</p>}
      {wordError && (
        <p role="alert" className="text-sm text-destructive">
          {wordError}
        </p>
      )}

      {!wordLoading && !wordError && (
        <Card>
          <CardHeader>
            <CardTitle>Word details</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Input value={word} onChange={(event) => setWord(event.target.value)} placeholder="Word" />
            <Textarea
              value={definition}
              onChange={(event) => setDefinition(event.target.value)}
              placeholder="Definition"
            />
            {saveError && (
              <p role="alert" className="text-sm text-destructive">
                {saveError}
              </p>
            )}
            <Button onClick={handleSaveWord} disabled={saving} className="self-start">
              {saving ? 'Saving…' : 'Save changes'}
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-between">
        <h2>Variants</h2>
        <Button size="sm" onClick={() => setAddVariantOpen(true)}>
          <Plus aria-hidden="true" className="size-4" />
          Add variant
        </Button>
      </div>

      {primaryError && (
        <p role="alert" className="text-sm text-destructive">
          {primaryError}
        </p>
      )}

      {loading && <p className="text-sm text-muted-foreground">Loading variants…</p>}
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      {!loading && !error && variants.length === 0 && (
        <p className="text-sm text-muted-foreground">No variants yet.</p>
      )}

      {!loading && !error && variants.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Variant</TableHead>
              <TableHead>Region</TableHead>
              <TableHead>Primary</TableHead>
              <TableHead>Videos</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {variants.map((variant) => (
              <TableRow key={variant.id}>
                <TableCell className="font-medium">{variant.variant_name}</TableCell>
                <TableCell className="text-muted-foreground">{variant.region ?? '—'}</TableCell>
                <TableCell>
                  <button
                    type="button"
                    onClick={() => handleMakePrimary(variant)}
                    aria-pressed={variant.is_primary}
                    aria-label={
                      variant.is_primary
                        ? `${variant.variant_name} is the primary variant`
                        : `Make ${variant.variant_name} the primary variant`
                    }
                    className="inline-flex items-center"
                  >
                    <Star
                      aria-hidden="true"
                      className={cn(
                        'size-4',
                        variant.is_primary ? 'fill-brand text-brand' : 'text-muted-foreground',
                      )}
                    />
                  </button>
                </TableCell>
                <TableCell>
                  <ul className="flex flex-col gap-1">
                    {variant.sign_videos.map((video) => (
                      <li key={video.id} className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Video aria-hidden="true" className="size-3.5" />
                        {video.format} · {formatDuration(video.duration_ms)} · {video.width}×{video.height}
                      </li>
                    ))}
                    {variant.sign_videos.length === 0 && (
                      <li className="text-sm text-muted-foreground">No videos yet</li>
                    )}
                  </ul>
                </TableCell>
                <TableCell>
                  <Button variant="outline" size="sm" onClick={() => setAddVideoTarget(variant)}>
                    <Plus aria-hidden="true" className="size-3.5" />
                    Add video
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {addVideoTarget && (
        <AddVideoDialog
          variant={addVideoTarget}
          open={addVideoTarget !== null}
          onOpenChange={(open) => !open && setAddVideoTarget(null)}
          onAdded={(video) =>
            setVariants((current) =>
              current.map((item) =>
                item.id === addVideoTarget.id
                  ? { ...item, sign_videos: [...item.sign_videos, video] }
                  : item,
              ),
            )
          }
        />
      )}

      <AddVariantDialog
        wordId={wordId}
        open={addVariantOpen}
        onOpenChange={setAddVariantOpen}
        onAdded={(variant) => setVariants((current) => [...current, variant])}
      />
    </div>
  )
}
