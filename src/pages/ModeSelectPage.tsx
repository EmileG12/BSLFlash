import type { ReactNode } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Infinity as InfinityIcon, ListOrdered, Tag } from 'lucide-react'
import { useCategoryInfo } from '../hooks/useCategoryInfo'
import { SubCategoryChips } from '../components/SubCategoryChips'
import '../components/SelectDeckCard.css'
import './ModeSelectPage.css'

interface ModeTileProps {
  icon: ReactNode
  label: string
  subtitle: string
  onClick: () => void
}

function ModeTile({ icon, label, subtitle, onClick }: ModeTileProps) {
  return (
    <button type="button" className="mode-tile" aria-label={label} onClick={onClick}>
      <span className="mode-tile-icon" aria-hidden="true">
        {icon}
      </span>
      <span className="mode-tile-label" aria-hidden="true">
        {label}
      </span>
      <span className="mode-tile-subtitle" aria-hidden="true">
        {subtitle}
      </span>
    </button>
  )
}

export function ModeSelectPage() {
  const { deckType, categoryId } = useParams<{ deckType: string; categoryId: string }>()
  const isValidDeckType = deckType === 'standard' || deckType === 'custom'
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const subcategoryId = searchParams.get('subcategory')

  const { categoryName, isVocabulary, loading } = useCategoryInfo(
    categoryId ?? '',
    isValidDeckType ? deckType : 'standard',
  )

  if (!categoryId || !isValidDeckType) {
    return <p className="text-sm text-destructive">No category selected.</p>
  }

  const modeHref = (mode: 'practice' | 'ten-cards') => {
    const base = `/flashcards/${deckType}/${categoryId}/${mode}`
    return subcategoryId ? `${base}?subcategory=${subcategoryId}` : base
  }

  const handleSelectSubcategory = (id: string | null) => {
    setSearchParams(id ? { subcategory: id } : {}, { replace: true })
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 p-4">
      <Card className="select-deck-card">
        <CardHeader className="selection-band -mt-(--card-spacing) gap-4 border-b border-brand pt-(--card-spacing)">
          <div className="mode-select-masthead">
            {loading ? (
              <span className="mode-select-masthead-kicker-skeleton motion-safe:animate-pulse" aria-hidden="true" />
            ) : categoryName ? (
              <div className="mode-select-masthead-kicker">
                <Tag size={20} aria-hidden="true" className="mode-select-masthead-kicker-icon" />
                <span className="mode-select-masthead-kicker-text">{categoryName}</span>
              </div>
            ) : null}
          </div>
          {isVocabulary && (
            <SubCategoryChips
              categoryId={categoryId}
              selectedId={subcategoryId}
              onSelect={handleSelectSubcategory}
            />
          )}
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <CardTitle className="mode-select-masthead-title">Choose a mode</CardTitle>
            <div className="mode-select-grid">
              <ModeTile
                icon={<InfinityIcon size={20} />}
                label="Practice"
                subtitle="Infinite cards, no score"
                onClick={() => navigate(modeHref('practice'))}
              />
              <ModeTile
                icon={<ListOrdered size={20} />}
                label="10 Cards"
                subtitle="10 random cards, scored"
                onClick={() => navigate(modeHref('ten-cards'))}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
