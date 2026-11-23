'use client'

import { startTransition, type FormEvent } from 'react'

/**
 * React resets a form after its action runs. On the sign-in cards a failed attempt must keep what the
 * person typed (their email, a new password), so after hydration the submit is dispatched in a
 * transition instead, as the Form kit's ActionForm does. Before hydration the form still posts natively.
 */
export function keepFields(dispatch: (form: FormData) => void) {
  return (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    startTransition(() => dispatch(data))
  }
}
