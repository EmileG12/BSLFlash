import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthCard } from '@/components/AuthCard'
import { AuthSwitchLink } from '@/components/AuthSwitchLink'
import { LabeledInput } from '@/components/LabeledInput'
import { Button } from '@/components/ui/button'
import { CardContent, CardFooter } from '@/components/ui/card'
import { MAX_SIGNUP_PASSWORD_LENGTH, MIN_SIGNUP_PASSWORD_LENGTH, signUp } from '../lib/auth'

export function SignupPage() {
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < MIN_SIGNUP_PASSWORD_LENGTH || password.length > MAX_SIGNUP_PASSWORD_LENGTH) {
      setError(
        `Password must be between ${MIN_SIGNUP_PASSWORD_LENGTH} and ${MAX_SIGNUP_PASSWORD_LENGTH} characters.`,
      )
      return
    }

    setSubmitting(true)
    try {
      const { hasSession } = await signUp(email, username, password)
      navigate(hasSession ? '/' : '/login', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthCard title="Sign up" description="Create an account to get started.">
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
            label="Username"
            id="username"
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            autoComplete="username"
            required
          />
          <LabeledInput
            label="Password"
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="new-password"
            required
          />
          <LabeledInput
            label="Confirm password"
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            autoComplete="new-password"
            required
          />
          {error && (
            <p role="alert" className="text-destructive text-sm">
              {error}
            </p>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-2 bg-muted">
          <Button type="submit" disabled={submitting} className="mx-auto w-11/12">
            {submitting ? 'Signing up…' : 'Sign up'}
          </Button>
          <AuthSwitchLink to="/login">Log In</AuthSwitchLink>
        </CardFooter>
      </form>
    </AuthCard>
  )
}
