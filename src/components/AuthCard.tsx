import type { ReactNode } from 'react'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface AuthCardProps {
  title: string
  description: string
  children: ReactNode
}

/** Shared Card scaffold (outer centered wrapper + title/description header) for auth pages. */
export function AuthCard({ title, description, children }: AuthCardProps) {
  return (
    <div className="flex min-h-svh items-center justify-center p-4">
      <Card className="w-[50vw]">
        <CardHeader>
          <CardTitle className="text-2xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        {children}
      </Card>
    </div>
  )
}
