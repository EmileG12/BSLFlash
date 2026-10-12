import type { ReactNode } from 'react'
import { cn } from 'cn'
import './TableCard.css'

export function TableCard({
  toolbar,
  children,
  className,
}: {
  toolbar?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10 shadow-[0_8px_12px_var(--shadow-color)]',
        className,
      )}
    >
      {toolbar && (
        <div className="admin-toolbar flex flex-col gap-3 border-b border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          {toolbar}
        </div>
      )}
      {children}
    </div>
  )
}
