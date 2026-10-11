import { useAllCategories } from '../hooks/useAllCategories'
import { TagChipList } from './TagChipList'

interface TagPickerProps {
  selectedIds: string[]
  onToggle: (id: string) => void
}

/** Multi-select tag picker for the Edit deck modal -- offers the FULL categories list (unlike TagFilterChips' tags-in-use-only directory filter), since a deck being tagged for the first time needs every admin-curated tag available, not just ones already attached to a public deck. */
export function TagPicker({ selectedIds, onToggle }: TagPickerProps) {
  const { categories, loading, error } = useAllCategories()

  return (
    <TagChipList
      heading="Tags"
      headingId="tag-picker-heading"
      tags={categories}
      loading={loading}
      error={error}
      selectedIds={selectedIds}
      onToggle={onToggle}
      emptyMessage="No tags available yet."
    />
  )
}
