import type { ComponentProps } from 'react'
import { Input } from '@/components/ui/input'

interface LabeledInputProps extends ComponentProps<typeof Input> {
  label: string
}

/** A label + Input pair, sharing the vertical layout LoginPage/SignupPage both repeat. */
export function LabeledInput({ label, id, ...props }: LabeledInputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <Input id={id} {...props} />
    </div>
  )
}
