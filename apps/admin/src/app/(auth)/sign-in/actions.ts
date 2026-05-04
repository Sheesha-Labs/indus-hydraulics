'use server'

import { signIn } from '../../../lib/auth'
import { AuthError } from 'next-auth'

export async function adminSignInAction(
  _prevState: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string } | null> {
  try {
    await signIn('credentials', {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      redirectTo: `${process.env.NEXTAUTH_URL ?? 'http://localhost:3001'}/`,
    })
  } catch (e) {
    if (e instanceof AuthError) {
      return { error: 'Invalid email or password.' }
    }
    // Next.js redirect throws — rethrow so it takes effect
    throw e
  }

  return null
}
