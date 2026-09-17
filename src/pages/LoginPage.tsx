import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthCard } from '@/components/AuthCard'
import { LabeledInput } from '@/components/LabeledInput'
import { Button } from '@/components/ui/button'
import { CardContent, CardFooter } from '@/components/ui/card'
import { signInWithPassword } from '../lib/auth'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      await signInWithPassword(email, password)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthCard title="Log in" description="Enter your email and password to continue.">
      <form onSubmit={handleSubmit} className="flex flex-col gap-(--card-spacing)">
        <CardContent className="flex flex-col gap-4">
          <LabeledInput
            label="Email"
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
          />
          <LabeledInput
            label="Password"
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
          />
          {error && (
            <p role="alert" className="text-destructive text-sm">
              {error}
            </p>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? 'Logging in…' : 'Log in'}
          </Button>
          <Link
            to="/signup"
            className="text-muted-foreground cursor-pointer text-center text-xs no-underline hover:underline"
          >
            Sign Up
          </Link>
        </CardFooter>
      </form>
    </AuthCard>
  )
}
