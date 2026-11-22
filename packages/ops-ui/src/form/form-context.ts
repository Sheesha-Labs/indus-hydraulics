'use client'

import { createContext, useContext } from 'react'
import type { FieldErrors } from '@indus/ops-core'

/**
 * The field errors of the last ActionForm submission, by field name. Field controls read their own entry,
 * so an action's `fieldErrors` land on the right field without the form knowing its fields.
 */
export const FormErrorsContext = createContext<FieldErrors>({})

/** The error ActionForm returned for `name`, if any. Outside an ActionForm, always undefined. */
export function useFieldError(name: string): string | undefined {
  return useContext(FormErrorsContext)[name]
}

/** True while the enclosing ActionForm's action is pending (read by SubmitButton). */
export const FormPendingContext = createContext(false)
