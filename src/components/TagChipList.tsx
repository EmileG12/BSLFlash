import { cn } from '@/lib/utils'
import { CHIP_BASE_CLASS, CHIP_SELECTED_CLASS, CHIP_UNSELECTED_CLASS } from '../lib/chipStyles'

export interface TagChipListTag {
  id: string
  category_name: string
}

interface TagChipListProps {
  heading: string
  headingId: string
  tags: TagChipListTag[]
  loading: boolean
  error: string | null
  selectedIds: string[]
  onToggle: (id: string) => void
  /** Shown in place of the chip row when there are zero tags and nothing is loading/erroring. Omit to render nothing in that case (e.g. a filter bar that should just disappear). */
  emptyMessage?: string
  /** Text shown under the chip row on a fetch error. Defaults to a generic message -- callers with a more specific fallback story (e.g. "showing all decks" when a filter's tag list fails) should override it. */
  errorMessage?: string
}

/** Multi-select tag chip row, shared by TagFilterChips (directory filter, tags-in-use-only) and TagPicker (deck editing, full tag list) -- only the data source differs between those two callers. */
export function TagChipList({
  heading,
  headingId,
  tags,
  loading,
  error,
  selectedIds,
  onToggle,
  emptyMessage,
  errorMessage = 'Tags unavailable',
}: TagChipListProps) {
  if (!loading && !error && tags.length === 0) {
    if (!emptyMessage) return null
    return <p className="text-sm text-muted-foreground">{emptyMessage}</p>
  }

  return (
    <div className="flex flex-col gap-2">
      <h3 id={headingId} className="text-sm font-medium text-muted-foreground">
        {heading}
      </h3>
      <div role="group" aria-labelledby={headingId} className="flex flex-wrap gap-2">
        {loading &&
          [0, 1, 2, 3].map((placeholder) => (
            <span
              key={placeholder}
              aria-hidden="true"
              className="h-9 w-20 rounded-full bg-muted motion-safe:animate-pulse"
            />
          ))}
        {loading && <span className="sr-only">Loading tags…</span>}
        {!loading &&
          tags.map((tag) => {
            const selected = selectedIds.includes(tag.id)
            return (
              <button
                key={tag.id}
                type="button"
                aria-pressed={selected}
                className={cn(CHIP_BASE_CLASS, selected ? CHIP_SELECTED_CLASS : CHIP_UNSELECTED_CLASS)}
                onClick={() => onToggle(tag.id)}
              >
                {tag.category_name}
              </button>
            )
          })}
      </div>
      {error && <p className="text-sm text-muted-foreground">{errorMessage}</p>}
    </div>
  )
}
