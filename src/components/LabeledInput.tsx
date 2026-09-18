import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'

interface LabeledInputProps extends ComponentProps<typeof Input> {
  label: string
}

/** A label + Input pair, sharing the vertical layout LoginPage/SignupPage both repeat. */
export function LabeledInput({ label, id, className, ...props }: LabeledInputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      {/*
        Overrides Input's default focus ring (a colored box-shadow "halo")
        with a plain neutral drop shadow instead: focus-visible:ring-0
        cancels the base ring-3, focus-visible:border-input keeps the
        border from shifting to --ring, so the shadow is the only focus
        indicator here.
      */}
      <Input
        id={id}
        className={cn(
          'focus-visible:border-input focus-visible:shadow-sm focus-visible:ring-0',
          className,
        )}
        {...props}
      />
    </div>
  )
}
