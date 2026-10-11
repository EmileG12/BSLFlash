import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { TableCard } from '../components/TableCard'
import { useWords } from '../hooks/useWords'

export function SuperadminWordsPage() {
  const { words, loading, error } = useWords()
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  const filtered = words.filter((word) => word.word.toLowerCase().includes(search.trim().toLowerCase()))

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4 p-4">
      <h1>Manage Words</h1>

      <TableCard
        toolbar={
          <Input
            placeholder="Search words"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full sm:max-w-xs"
          />
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((word) => (
                <TableRow
                  key={word.id}
                  className="cursor-pointer"
                  onClick={() => navigate(`/superadmin/words/${word.id}`)}
                >
                  <TableCell className="font-medium">{word.word}</TableCell>
                  <TableCell className="max-w-md truncate text-muted-foreground">{word.definition}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </TableCard>
    </div>
  )
}
