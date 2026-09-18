import { Link } from 'react-router-dom'

interface AuthSwitchLinkProps {
  to: string
  children: string
}

/** Small "switch to the other auth page" link shared by LoginPage/SignupPage. */
export function AuthSwitchLink({ to, children }: AuthSwitchLinkProps) {
  return (
    <Link
      to={to}
      className="text-muted-foreground cursor-pointer text-center text-xs no-underline hover:underline"
    >
      {children}
    </Link>
  )
}
