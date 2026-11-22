import type { ReactNode } from 'react'
import type { Ccy } from '../types'

export type FieldType = 'text' | 'number' | 'money' | 'date' | 'select' | 'textarea' | 'email'

/** A field's non-default look. Focus is CSS; an error comes from `error` or the enclosing ActionForm. */
export type FieldState = 'readonly' | 'disabled' | 'assistant'

export interface FieldOption {
  value: string
  label: string
}

export interface FieldBase {
  label: string
  /** The FormData key, and the key ActionForm matches `fieldErrors` against. */
  name: string
  /** Under the control, 11.5 ink-3. An error replaces it. */
  hint?: ReactNode
  /** Replaces the hint, sets aria-invalid and the bad border and halo. */
  error?: string
  /** Red `*` after the label and the native `required`. */
  required?: boolean
  /** "optional" after the label. Mutually exclusive with `required` in practice. */
  optional?: boolean
  /** A cell before the value with a rule after it. Money defaults it to the currency. */
  prefix?: string
  /** A unit after the value, e.g. "%". */
  suffix?: string
  state?: FieldState
  /** With state 'assistant': a "Why?" link to /why/<evidenceId> under the control. */
  assistantSource?: { evidenceId: string }
  placeholder?: string
  /** Uncontrolled: the field renders on the server and posts with FormData. */
  defaultValue?: string
  /** An explicit id for the control; otherwise a generated one. */
  id?: string
  className?: string
  /** Extra classes on the control frame. Specimens use it to draw the focus ring at rest. */
  controlClassName?: string
}

/** 05 §3.5: money requires a currency, select requires options. */
export type FieldProps =
  | (FieldBase & { type: 'text' | 'email' | 'number' | 'date' | 'textarea' })
  | (FieldBase & { type: 'money'; currency: Ccy })
  | (FieldBase & { type: 'select'; options: FieldOption[] })
