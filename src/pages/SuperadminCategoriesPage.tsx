import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { TableCard } from '../components/TableCard'
import { cn } from '@/lib/utils'
import { useManagedCategories, type ManagedCategory } from '../hooks/useManagedCategories'
import { supabase } from '../lib/supabase'

export function SuperadminCategoriesPage() {
  const { categories, loading, error, setCategories } = useManagedCategories()
  const [newName, setNewName] = useState('')
  const [newIsVocabulary, setNewIsVocabulary] = useState(false)
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [rowError, setRowError] = useState<string | null>(null)

  async function handleCreate() {
    const trimmed = newName.trim()
    if (trimmed === '') return
    setCreating(true)
    setCreateError(null)
    const { data, error } = await supabase
      .from('categories')
      .insert({ category_name: trimmed, is_vocabulary: newIsVocabulary })
      .select('id, category_name, is_vocabulary, is_active')
      .single()
    setCreating(false)
    if (error) {
      setCreateError(error.message)
      return
    }
    setCategories((previous) =>
      [...previous, data].sort((a, b) => a.category_name.localeCompare(b.category_name)),
    )
    setNewName('')
    setNewIsVocabulary(false)
  }

  async function handleRenameSave(category: ManagedCategory) {
    const trimmed = editingName.trim()
    setEditingId(null)
    if (trimmed === '' || trimmed === category.category_name) return
    setRowError(null)
    const { error } = await supabase
      .from('categories')
      .update({ category_name: trimmed })
      .eq('id', category.id)
    if (error) {
      setRowError(error.message)
      return
    }
    setCategories((previous) =>
      previous.map((item) => (item.id === category.id ? { ...item, category_name: trimmed } : item)),
    )
  }

  async function handleToggle(
    category: ManagedCategory,
    field: 'is_vocabulary' | 'is_active',
    value: boolean,
  ) {
    setRowError(null)
    const updates = field === 'is_vocabulary' ? { is_vocabulary: value } : { is_active: value }
    const { error } = await supabase.from('categories').update(updates).eq('id', category.id)
    if (error) {
      setRowError(error.message)
      return
    }
    setCategories((previous) =>
      previous.map((item) => (item.id === category.id ? { ...item, [field]: value } : item)),
    )
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4 p-4">
      <h1>Manage Categories</h1>

      <Card>
        <CardHeader>
          <CardTitle>Create category</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Input
              placeholder="Category name"
              value={newName}
              onChange={(event) => setNewName(event.target.value)}
              className="sm:max-w-xs"
            />
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <Switch checked={newIsVocabulary} onCheckedChange={setNewIsVocabulary} />
              Vocabulary category
            </label>
            <Button onClick={handleCreate} disabled={creating || newName.trim() === ''}>
              <Plus aria-hidden="true" className="size-4" />
              {creating ? 'Creating…' : 'Create category'}
            </Button>
          </div>
          {createError && (
            <p role="alert" className="text-sm text-destructive">
              {createError}
            </p>
          )}
        </CardContent>
      </Card>

      {rowError && (
        <p role="alert" className="text-sm text-destructive">
          {rowError}
        </p>
      )}

      {loading && <p className="text-sm text-muted-foreground">Loading categories…</p>}
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      {!loading && !error && categories.length === 0 && (
        <p className="text-sm text-muted-foreground">No categories yet.</p>
      )}

      {!loading && !error && categories.length > 0 && (
        <TableCard>
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Vocabulary</TableHead>
                <TableHead>Active</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow
                  key={category.id}
                  className={cn(!category.is_active && 'text-muted-foreground')}
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {editingId === category.id ? (
                        <Input
                          autoFocus
                          value={editingName}
                          onChange={(event) => setEditingName(event.target.value)}
                          onBlur={() => handleRenameSave(category)}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter') event.currentTarget.blur()
                            if (event.key === 'Escape') setEditingId(null)
                          }}
                          className="h-8"
                        />
                      ) : (
                        <button
                          type="button"
                          className="text-left hover:underline"
                          onClick={() => {
                            setEditingId(category.id)
                            setEditingName(category.category_name)
                          }}
                        >
                          {category.category_name}
                        </button>
                      )}
                      {!category.is_active && (
                        <Badge className="bg-warning text-warning-foreground">Hidden</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={category.is_vocabulary}
                      onCheckedChange={(value) => handleToggle(category, 'is_vocabulary', value)}
                      aria-label={`Vocabulary category: ${category.category_name}`}
                    />
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={category.is_active}
                      onCheckedChange={(value) => handleToggle(category, 'is_active', value)}
                      aria-label={`Active: ${category.category_name}`}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableCard>
      )}
    </div>
  )
}
