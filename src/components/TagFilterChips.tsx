import { useAvailableDeckTags } from '../hooks/useAvailableDeckTags'
import { TagChipList } from './TagChipList'

interface TagFilterChipsProps {
  selectedIds: string[]
  onToggle: (id: string) => void
}

/** Multi-select tag chips for the Browse decks directory -- unlike SubCategoryChips (single-select, "narrow to one topic"), any number of tags can be active at once (AND semantics, enforced server-side by get_public_decks). Only offers tags currently in use on a public deck (see useAvailableDeckTags); TagPicker (deck editing) offers the full tag list instead via the same TagChipList. */
export function TagFilterChips({ selectedIds, onToggle }: TagFilterChipsProps) {
  const { tags, loading, error } = useAvailableDeckTags()

  return (
    <TagChipList
      heading="Filter by tag"
      headingId="tag-filter-chips-heading"
      tags={tags}
      loading={loading}
      error={error}
      selectedIds={selectedIds}
      onToggle={onToggle}
      errorMessage="Tags unavailable — showing all decks"
    />
  )
}
