import { useAuth } from '../hooks/useAuth'
import { SelectDeckCard } from '../components/SelectDeckCard'

export function HomePage() {
  const { session } = useAuth()

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 p-4">
      <h1 className="text-2xl font-medium">
        Welcome{session?.user.email ? `, ${session.user.email}` : ''}
      </h1>
      <SelectDeckCard />
    </div>
  )
}
