import { useAuth } from '../hooks/useAuth'

export function HomePage() {
  const { session } = useAuth()

  return (
    <div>
      <h1>Welcome{session?.user.email ? `, ${session.user.email}` : ''}</h1>
      <p>This is a placeholder home page.</p>
    </div>
  )
}
