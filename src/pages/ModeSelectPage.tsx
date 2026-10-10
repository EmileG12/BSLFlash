import type { ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Infinity as InfinityIcon, ListOrdered } from 'lucide-react'
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

  if (!categoryId || !isValidDeckType) {
    return <p className="text-sm text-destructive">No category selected.</p>
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 p-4">
      <Card className="select-deck-card">
        <CardHeader>
          <CardTitle className="text-2xl">Select a mode</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mode-select-grid">
            <ModeTile
              icon={<InfinityIcon size={20} />}
              label="Practice"
              subtitle="Untimed, keep going"
              onClick={() => navigate(`/flashcards/${deckType}/${categoryId}/practice`)}
            />
            <ModeTile
              icon={<ListOrdered size={20} />}
              label="10 Cards"
              subtitle="Timed round, scored"
              onClick={() => navigate(`/flashcards/${deckType}/${categoryId}/ten-cards`)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
