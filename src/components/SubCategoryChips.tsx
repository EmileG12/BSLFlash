import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { supabase } from '../lib/supabase'

interface SubCategory {
  id: string
  category_name: string
}

interface SubCategoryChipsProps {
  categoryId: string
  selectedId: string | null
  onSelect: (id: string | null) => void
}

// Sits on the brand-tinted `.selection-band` gradient, so its focus ring uses
// --ring-on-brand (not the app-wide --ring/--brand) to stay above the 3:1
// WCAG minimum against that backdrop -- --ring measured as low as 2.09:1 there.
const CHIP_BASE_CLASS =
  'inline-flex items-center justify-center whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring-on-brand)]'

const CHIP_SELECTED_CLASS = 'border-brand bg-brand text-brand-contrast'

const CHIP_UNSELECTED_CLASS =
  'border-border bg-background text-foreground hover:border-brand hover:bg-brand-muted hover:text-brand'

/** Lets the user narrow a vocabulary category's word pool to one topic subcategory (or "All"). Only rendered for vocabulary categories. */
export function SubCategoryChips({ categoryId, selectedId, onSelect }: SubCategoryChipsProps) {
  const [subcategories, setSubcategories] = useState<SubCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    supabase
      .rpc('get_available_subcategories_for_category', { category_id: categoryId })
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) {
          setError(error.message)
          setSubcategories([])
        } else {
          setSubcategories(data ?? [])
        }
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [categoryId])

  return (
    <div className="flex flex-col gap-2">
      <h3 id="subcategory-chips-heading" className="text-sm font-medium text-muted-foreground">
        Narrow by topic
      </h3>
      <div role="group" aria-labelledby="subcategory-chips-heading" className="flex flex-wrap gap-2">
        <button
          type="button"
          aria-pressed={selectedId === null}
          className={cn(CHIP_BASE_CLASS, selectedId === null ? CHIP_SELECTED_CLASS : CHIP_UNSELECTED_CLASS)}
          onClick={() => onSelect(null)}
        >
          All
        </button>
        {loading &&
          [0, 1, 2, 3].map((placeholder) => (
            <span
              key={placeholder}
              aria-hidden="true"
              className="h-9 w-20 rounded-full bg-muted motion-safe:animate-pulse"
            />
          ))}
        {loading && <span className="sr-only">Loading topics…</span>}
        {!loading &&
          subcategories.map((subcategory) => (
            <button
              key={subcategory.id}
              type="button"
              aria-pressed={selectedId === subcategory.id}
              className={cn(
                CHIP_BASE_CLASS,
                selectedId === subcategory.id ? CHIP_SELECTED_CLASS : CHIP_UNSELECTED_CLASS,
              )}
              onClick={() => onSelect(subcategory.id)}
            >
              {subcategory.category_name}
            </button>
          ))}
      </div>
      {error && <p className="text-sm text-muted-foreground">Topics unavailable — showing all signs</p>}
    </div>
  )
}
