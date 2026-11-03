import { useMemo, useState, type MouseEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Info, Plus, X } from 'lucide-react'
import type { WordOption } from '../hooks/useWords'

interface WordPickerProps {
  words: WordOption[]
  loading: boolean
  error: string | null
  selectedIds: string[]
  onAdd: (id: string) => void
  onRemove: (id: string) => void
}

/** Two-column word catalog / selected-words picker, shared by CreateDeckPage and EditDeckModal so neither duplicates this markup. */
export function WordPicker({ words, loading, error, selectedIds, onAdd, onRemove }: WordPickerProps) {
  const [search, setSearch] = useState('')
  const [openWordId, setOpenWordId] = useState<string | null>(null)

  // A row's open popover can visually cover the trigger of the row directly
  // below it (the lists are packed tightly). Letting clicks pass through the
  // whole popover to whatever's underneath would also let them reach that
  // row's much bigger add/remove button -- so the popover stays click-blocking
  // by default, and this handler only forwards a click to the one safe case:
  // another word's own "show definition" trigger, found by momentarily hiding
  // this popover from hit-testing and checking what's directly underneath.
  function passClickThroughToCoveredTrigger(event: MouseEvent<HTMLElement>) {
    const content = event.currentTarget
    // Radix Popper positions content inside its own wrapper div; elementFromPoint
    // hits that wrapper first unless it's hidden from hit-testing too, not just
    // the content node itself.
    const wrapper = content.closest<HTMLElement>('[data-radix-popper-content-wrapper]')
    content.style.pointerEvents = 'none'
    if (wrapper) wrapper.style.pointerEvents = 'none'
    const covered = document.elementFromPoint(event.clientX, event.clientY)
    content.style.pointerEvents = ''
    if (wrapper) wrapper.style.pointerEvents = ''
    const coveredTrigger = covered?.closest<HTMLElement>('[data-slot="popover-trigger"]')
    coveredTrigger?.click()
  }

  function closeIfOpen(id: string) {
    setOpenWordId((current) => (current === id ? null : current))
  }

  function definitionPopover(word: WordOption) {
    return (
      <Popover
        open={openWordId === word.id}
        onOpenChange={(next) => setOpenWordId(next ? word.id : null)}
      >
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            className="size-11"
            aria-label={`Show definition of ${word.word}`}
          >
            <Info className="size-4 text-muted-foreground" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          side="bottom"
          align="end"
          className="max-w-64 whitespace-normal break-words"
          onClick={passClickThroughToCoveredTrigger}
        >
          {word.definition}
        </PopoverContent>
      </Popover>
    )
  }

  const wordsById = useMemo(() => new Map(words.map((word) => [word.id, word])), [words])
  const selectedWords = selectedIds
    .map((id) => wordsById.get(id))
    .filter((word) => word !== undefined)

  const availableWords = words.filter(
    (word) =>
      !selectedIds.includes(word.id) && word.word.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <>
      <div
        role="group"
        className="flex max-h-[40vh] min-h-0 flex-col gap-2 px-(--card-spacing) pt-(--card-spacing) md:max-h-none"
        aria-label="Word catalog"
      >
        <Input
          placeholder="Search words..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto rounded-lg bg-card p-1">
          {loading ? (
            <p className="p-2 text-sm text-muted-foreground">Loading words...</p>
          ) : error ? (
            <p className="p-2 text-sm text-destructive">Failed to load words: {error}</p>
          ) : availableWords.length === 0 ? (
            <p className="p-2 text-sm text-muted-foreground">No words match your search.</p>
          ) : (
            availableWords.map((word) => (
              <div key={word.id} className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  className="min-h-11 flex-1 justify-start"
                  onClick={() => {
                    closeIfOpen(word.id)
                    onAdd(word.id)
                  }}
                >
                  <Plus aria-hidden="true" className="size-4 text-muted-foreground" />
                  {word.word}
                </Button>
                {definitionPopover(word)}
              </div>
            ))
          )}
        </div>
      </div>

      <div
        role="group"
        className="flex max-h-[40vh] min-h-0 flex-col gap-2 border-t border-brand bg-brand-muted px-(--card-spacing) py-(--card-spacing) md:max-h-none md:border-t-0 md:border-l"
        aria-label="Selected words"
      >
        <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto rounded-lg p-1">
          {selectedWords.length === 0 ? (
            <p className="p-2 text-sm text-muted-foreground">
              Select words from the left to add them here.
            </p>
          ) : (
            selectedWords.map((word) => (
              <div
                key={word.id}
                className="flex items-center justify-between rounded-md px-2.5 py-1 text-sm text-foreground"
              >
                {word.word}
                <div className="flex items-center gap-1">
                  {definitionPopover(word)}
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="size-11"
                    aria-label={`Remove ${word.word}`}
                    onClick={() => {
                      closeIfOpen(word.id)
                      onRemove(word.id)
                    }}
                  >
                    <X />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  )
}
