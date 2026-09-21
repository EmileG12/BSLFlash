import { useNavigate, useParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function ModeSelectPage() {
  const { categoryId } = useParams<{ categoryId: string }>()
  const navigate = useNavigate()

  if (!categoryId) {
    return <p className="text-sm text-destructive">No category selected.</p>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Select a mode</CardTitle>
      </CardHeader>
      <CardContent className="flex gap-3">
        <Button onClick={() => navigate(`/flashcards/${categoryId}/practice`)}>Practice</Button>
        <Button onClick={() => navigate(`/flashcards/${categoryId}/ten-cards`)}>10 Cards</Button>
      </CardContent>
    </Card>
  )
}
