import { useState } from 'react'
import { GraduationCap, Search, Tags } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { SelectDeckCard } from '../components/SelectDeckCard'

export function HomePage() {
  const [search, setSearch] = useState('')

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4 p-4">
      <Card className="select-deck-card">
        <CardHeader className="selection-band -mt-(--card-spacing) border-b border-brand pt-(--card-spacing)">
          <CardTitle className="text-2xl">Pick a deck to practise</CardTitle>
          <CardDescription>
            BSLFlash teaches British Sign Language through short video flashcards. Pick an
            everyday topic or an exam-linked list below, then test yourself sign by sign.
          </CardDescription>
        </CardHeader>
        <CardContent className="-mt-(--card-spacing) flex flex-col gap-4 pt-4">
          <div className="relative">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              placeholder="Search categories..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search categories"
              className="pl-8"
            />
          </div>
          <SelectDeckCard
            vocabulary={false}
            variant="bare"
            title="Everyday topics"
            subtitle="Animals, greetings, colours, and more"
            icon={<Tags className="size-5" />}
            search={search}
          />
          <div className="border-t border-border" aria-hidden="true" />
          <SelectDeckCard
            vocabulary={true}
            variant="bare"
            title="Exam & qualification lists"
            subtitle="Vocabulary tied to a course, like GCSE"
            icon={<GraduationCap className="size-5" />}
            search={search}
          />
        </CardContent>
      </Card>
    </div>
  )
}
