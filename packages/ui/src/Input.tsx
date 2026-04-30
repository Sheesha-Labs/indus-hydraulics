import * as React from 'react'
import * as LabelPrimitive from '@radix-ui/react-label'
import { cn } from './lib/utils'

// ── Input ────────────────────────────────────────────────────────────────────

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-9 w-full border border-[var(--color-border)] bg-[var(--color-elevated)] px-3 py-2',
          'text-sm text-[var(--color-primary)] placeholder:text-[var(--color-caption)]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-0',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'transition-colors',
          error && 'border-[var(--color-danger)] focus-visible:ring-[var(--color-danger)]',
          className
        )}
        ref={ref}
        aria-invalid={error ? 'true' : undefined}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

// ── Textarea ─────────────────────────────────────────────────────────────────

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[80px] w-full border border-[var(--color-border)] bg-[var(--color-elevated)] px-3 py-2',
          'text-sm text-[var(--color-primary)] placeholder:text-[var(--color-caption)]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]',
          'disabled:cursor-not-allowed disabled:opacity-50 resize-y',
          'transition-colors',
          error && 'border-[var(--color-danger)] focus-visible:ring-[var(--color-danger)]',
          className
        )}
        ref={ref}
        aria-invalid={error ? 'true' : undefined}
        {...props}
      />
    )
  }
)
Textarea.displayName = 'Textarea'

// ── Label ─────────────────────────────────────────────────────────────────────

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> & { required?: boolean }
>(({ className, required, children, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn('text-xs font-medium text-[var(--color-body)] leading-none', className)}
    {...props}
  >
    {children}
    {required && <span className="text-[var(--color-danger)] ml-0.5">*</span>}
  </LabelPrimitive.Root>
))
Label.displayName = LabelPrimitive.Root.displayName

// ── FieldError ───────────────────────────────────────────────────────────────

export function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <p className="text-xs text-[var(--color-danger)] mt-1" role="alert">
      {message}
    </p>
  )
}

// ── Field (label + input + error wrapper) ────────────────────────────────────

export interface FieldProps {
  label: string
  htmlFor?: string
  required?: boolean
  error?: string
  hint?: string
  children: React.ReactNode
  className?: string
}

export function Field({ label, htmlFor, required, error, hint, children, className }: FieldProps) {
  const labelProps: React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> & { required?: boolean } = {}
  if (htmlFor !== undefined) labelProps.htmlFor = htmlFor
  if (required !== undefined) labelProps.required = required
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <Label {...labelProps}>{label}</Label>
      {children}
      {hint && !error && <p className="text-xs text-[var(--color-caption)]">{hint}</p>}
      {error && <FieldError message={error} />}
    </div>
  )
}

export { Input, Textarea, Label }
