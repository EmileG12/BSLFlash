import { useState } from 'react'
import { Pencil, Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { TableCard } from '../components/TableCard'
import { TagPicker } from '../components/TagPicker'
import { useWords, type WordOption } from '../hooks/useWords'
import { supabase } from '../lib/supabase'
import { uploadSignVideo } from '../lib/signVideoUpload'

function AddWordForm() {
  const [word, setWord] = useState('')
  const [definition, setDefinition] = useState('')
  const [videoFile, setVideoFile] = useState<File | null>(null)
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
    try {
      const { data: newWord, error: wordError } = await supabase
        .from('words')
        .insert({ word: trimmedWord, definition: trimmedDefinition })
        .select('id')
        .single()
      if (wordError) throw wordError

      const { data: newSign, error: signError } = await supabase
        .from('signs')
        .insert({ word_id: newWord.id, variant_name: 'Standard', is_primary: true })
        .select('id')
        .single()
      if (signError) throw signError

      await uploadSignVideo(newSign.id, videoFile)

      if (categoryIds.length > 0) {
        const { error: tagError } = await supabase
          .from('word_categories')
          .insert(categoryIds.map((categoryId) => ({ word_id: newWord.id, category_id: categoryId })))
        if (tagError) throw tagError
      }

      setSuccessMessage(`Added "${trimmedWord}".`)
      setWord('')
      setDefinition('')
      setVideoFile(null)
      setCategoryIds([])
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Failed to add word.')
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
          type="file"
          accept="video/mp4,video/webm"
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

function EditWordCategoriesRow({ word }: { word: WordOption }) {
  const [expanded, setExpanded] = useState(false)
  const [categoryIds, setCategoryIds] = useState<string[] | null>(null)
  const [loadingTags, setLoadingTags] = useState(false)
  const [tagError, setTagError] = useState<string | null>(null)

  async function handleExpand() {
    if (expanded) {
      setExpanded(false)
      return
    }
    setExpanded(true)
    if (categoryIds !== null) return
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
    setCategoryIds(data.map((row) => row.category_id))
  }

  async function handleToggle(categoryId: string) {
    if (categoryIds === null) return
    setTagError(null)
    const alreadySelected = categoryIds.includes(categoryId)
    if (alreadySelected) {
      const { error } = await supabase
        .from('word_categories')
        .delete()
        .eq('word_id', word.id)
        .eq('category_id', categoryId)
      if (error) {
        setTagError(error.message)
        return
      }
      setCategoryIds((previous) => (previous ?? []).filter((id) => id !== categoryId))
    } else {
      const { error } = await supabase.from('word_categories').insert({
        word_id: word.id,
        category_id: categoryId,
      })
      if (error) {
        setTagError(error.message)
        return
      }
      setCategoryIds((previous) => [...(previous ?? []), categoryId])
    }
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
            {loadingTags && <p className="text-sm text-muted-foreground">Loading categories…</p>}
            {!loadingTags && categoryIds !== null && (
              <TagPicker selectedIds={categoryIds} onToggle={handleToggle} />
            )}
            {tagError && (
              <p role="alert" className="text-sm text-destructive">
                {tagError}
              </p>
            )}
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
