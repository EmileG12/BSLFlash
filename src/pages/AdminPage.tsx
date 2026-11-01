import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Check, Pencil, Plus, RotateCcw } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { TableCard } from '../components/TableCard'
import { TagPicker } from '../components/TagPicker'
import { useWords, type WordOption } from '../hooks/useWords'
import { supabase } from '../lib/supabase'
import { deleteSignVideoFile, uploadSignVideoFile } from '../lib/signVideoUpload'

function AddWordForm() {
  const queryClient = useQueryClient()
  const [word, setWord] = useState('')
  const [definition, setDefinition] = useState('')
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoInputKey, setVideoInputKey] = useState(0)
  const [categoryIds, setCategoryIds] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  function toggleCategory(id: string) {
    setCategoryIds((previous) =>
      previous.includes(id) ? previous.filter((existing) => existing !== id) : [...previous, id],
    )
  }

  async function handleSubmit() {
    const trimmedWord = word.trim()
    const trimmedDefinition = definition.trim()
    setSuccessMessage(null)

    if (trimmedWord === '' || trimmedDefinition === '' || !videoFile) {
      setFormError('Word, definition, and a video are all required.')
      return
    }

    setSubmitting(true)
    setFormError(null)

    const signId = crypto.randomUUID()
    let uploaded: Awaited<ReturnType<typeof uploadSignVideoFile>>
    try {
      uploaded = await uploadSignVideoFile(signId, videoFile)
    } catch (uploadError) {
      setFormError(
        `Video upload failed: ${uploadError instanceof Error ? uploadError.message : 'unknown error'}. No changes were saved.`,
      )
      setSubmitting(false)
      return
    }

    try {
      const { error } = await supabase.rpc('add_word_with_video', {
        p_word: trimmedWord,
        p_definition: trimmedDefinition,
        p_sign_id: signId,
        p_storage_path: uploaded.storagePath,
        p_format: uploaded.format,
        p_duration_ms: uploaded.metadata.durationMs,
        p_width: uploaded.metadata.width,
        p_height: uploaded.metadata.height,
        p_file_size: videoFile.size,
        p_category_ids: categoryIds,
      })
      if (error) throw error

      queryClient.invalidateQueries({ queryKey: ['words'] })
      setSuccessMessage(`Added "${trimmedWord}".`)
      setWord('')
      setDefinition('')
      setVideoFile(null)
      setVideoInputKey((previous) => previous + 1)
      setCategoryIds([])
    } catch (writeError) {
      const cleanedUp = await deleteSignVideoFile(uploaded.storagePath).then(
        () => true,
        () => false,
      )
      const message = (writeError as { message?: string } | null)?.message ?? 'unknown error'
      setFormError(
        cleanedUp
          ? `Failed to add word: ${message}. No changes were saved.`
          : `Failed to add word: ${message}. No changes were saved, but the uploaded video file could not be removed and may need manual cleanup (path: ${uploaded.storagePath}).`,
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add a new word</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Input placeholder="Word" value={word} onChange={(event) => setWord(event.target.value)} />
        <Textarea
          placeholder="Definition"
          value={definition}
          onChange={(event) => setDefinition(event.target.value)}
        />
        <Input
          key={videoInputKey}
          type="file"
          aria-label="Video file"
          accept="video/mp4,video/webm"
          className="cursor-pointer file:cursor-pointer"
          onChange={(event) => setVideoFile(event.target.files?.[0] ?? null)}
        />
        <TagPicker selectedIds={categoryIds} onToggle={toggleCategory} />
        {formError && (
          <p role="alert" className="text-sm text-destructive">
            {formError}
          </p>
        )}
        {successMessage && (
          <p role="status" className="text-sm text-success">
            {successMessage}
          </p>
        )}
        <Button onClick={handleSubmit} disabled={submitting} className="self-start">
          <Plus aria-hidden="true" className="size-4" />
          {submitting ? 'Adding…' : 'Add word'}
        </Button>
      </CardContent>
    </Card>
  )
}

function sameIds(a: string[], b: string[]) {
  if (a.length !== b.length) return false
  const sortedA = [...a].sort()
  const sortedB = [...b].sort()
  return sortedA.every((id, index) => id === sortedB[index])
}

function EditWordCategoriesRow({ word }: { word: WordOption }) {
  const [expanded, setExpanded] = useState(false)
  const [savedCategoryIds, setSavedCategoryIds] = useState<string[] | null>(null)
  const [draftCategoryIds, setDraftCategoryIds] = useState<string[] | null>(null)
  const [loadingTags, setLoadingTags] = useState(false)
  const [saving, setSaving] = useState(false)
  const [tagError, setTagError] = useState<string | null>(null)

  const isDirty =
    savedCategoryIds !== null && draftCategoryIds !== null && !sameIds(savedCategoryIds, draftCategoryIds)

  async function handleExpand() {
    if (expanded) {
      setExpanded(false)
      return
    }
    setExpanded(true)
    if (savedCategoryIds !== null) return
    setLoadingTags(true)
    const { data, error } = await supabase
      .from('word_categories')
      .select('category_id')
      .eq('word_id', word.id)
    setLoadingTags(false)
    if (error) {
      setTagError(error.message)
      return
    }
    const ids = data.map((row) => row.category_id)
    setSavedCategoryIds(ids)
    setDraftCategoryIds(ids)
  }

  function handleToggle(categoryId: string) {
    setDraftCategoryIds((previous) => {
      if (previous === null) return previous
      return previous.includes(categoryId)
        ? previous.filter((id) => id !== categoryId)
        : [...previous, categoryId]
    })
  }

  function handleRevert() {
    setTagError(null)
    setDraftCategoryIds(savedCategoryIds)
  }

  async function handleSaveEdit() {
    if (savedCategoryIds === null || draftCategoryIds === null) return
    setTagError(null)
    setSaving(true)

    const { error } = await supabase.rpc('set_word_categories', {
      p_word_id: word.id,
      p_category_ids: draftCategoryIds,
    })
    setSaving(false)
    if (error) {
      setTagError(error.message)
      return
    }

    setSavedCategoryIds(draftCategoryIds)
  }

  return (
    <>
      <TableRow>
        <TableCell className="font-medium">{word.word}</TableCell>
        <TableCell className="max-w-xs truncate text-muted-foreground">{word.definition}</TableCell>
        <TableCell>
          <Button variant="outline" size="sm" aria-expanded={expanded} onClick={handleExpand}>
            <Pencil aria-hidden="true" className="size-3.5" />
            {expanded ? 'Close' : 'Edit categories'}
          </Button>
        </TableCell>
      </TableRow>
      {expanded && (
        <TableRow>
          <TableCell colSpan={3} className="bg-muted/30">
            <div className="flex flex-col gap-3">
              {loadingTags && <p className="text-sm text-muted-foreground">Loading categories…</p>}
              {!loadingTags && draftCategoryIds !== null && (
                <>
                  <TagPicker selectedIds={draftCategoryIds} onToggle={handleToggle} />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="bg-success text-primary-foreground hover:bg-success/80"
                      onClick={handleSaveEdit}
                      disabled={!isDirty || saving}
                    >
                      <Check aria-hidden="true" className="size-3.5" />
                      {saving ? 'Saving…' : 'Save edit'}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleRevert} disabled={!isDirty || saving}>
                      <RotateCcw aria-hidden="true" className="size-3.5" />
                      Revert changes
                    </Button>
                  </div>
                </>
              )}
              {tagError && (
                <p role="alert" className="text-sm text-destructive">
                  {tagError}
                </p>
              )}
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  )
}

export function AdminPage() {
  const { words, loading, error } = useWords()
  const [search, setSearch] = useState('')

  const filtered = words.filter((word) => word.word.toLowerCase().includes(search.trim().toLowerCase()))

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4 p-4">
      <h1>Admin</h1>

      <AddWordForm />

      <TableCard
        toolbar={
          <>
            <h2 className="text-base font-medium">Edit word categories</h2>
            <Input
              placeholder="Search words"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full bg-card sm:max-w-xs dark:bg-card"
            />
          </>
        }
      >
        {loading && <p className="px-4 py-6 text-sm text-muted-foreground">Loading words…</p>}
        {error && (
          <p role="alert" className="px-4 py-6 text-sm text-destructive">
            {error}
          </p>
        )}
        {!loading && !error && filtered.length === 0 && (
          <p className="px-4 py-6 text-sm text-muted-foreground">No words match.</p>
        )}
        {!loading && !error && filtered.length > 0 && (
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead>Word</TableHead>
                <TableHead>Definition</TableHead>
                <TableHead>Categories</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((word) => (
                <EditWordCategoriesRow key={word.id} word={word} />
              ))}
            </TableBody>
          </Table>
        )}
      </TableCard>
    </div>
  )
}
