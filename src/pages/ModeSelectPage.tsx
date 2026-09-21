import { useNavigate, useParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import '../components/SelectDeckCard.css'

export function ModeSelectPage() {
  const { categoryId } = useParams<{ categoryId: string }>()
  const navigate = useNavigate()

  if (!categoryId) {
    return <p className="text-sm text-destructive">No category selected.</p>
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 p-4">
      <Card className="select-deck-card">
        <CardHeader>
          <CardTitle className="text-2xl">Select a mode</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="select-deck-grid">
            <Button
              variant="outline"
              className="select-deck-button"
              onClick={() => navigate(`/flashcards/${categoryId}/practice`)}
            >
              Practice
            </Button>
            <Button
              variant="outline"
              className="select-deck-button"
              onClick={() => navigate(`/flashcards/${categoryId}/ten-cards`)}
            >
              10 Cards
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
