'use server'

import { signIn, signOut } from '../../../lib/auth'
import { safeNextPath } from '../../../lib/safe-next-path'

export async function signInWithGoogle(formData: FormData): Promise<void> {
  await signIn('google', { redirectTo: safeNextPath(formData.get('next')) ?? '/today' })
}

export async function signOutAction(): Promise<void> {
  await signOut({ redirectTo: '/sign-in' })
}
