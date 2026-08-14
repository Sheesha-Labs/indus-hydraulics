'use server'

import { AuthError } from 'next-auth'
import { redirect } from 'next/navigation'
import { signIn, signOut } from '../../../lib/auth'
import { safeNextPath } from '../../../lib/safe-next-path'

/**
 * Staff sign-in.
 *
 * This is a server action rather than a client `signIn()` from
 * `next-auth/react` on purpose. That client helper resolves its base path from
 * `NEXTAUTH_URL` **at build time** (`next-auth/lib/client.js` returns
 * `/api/auth` whenever the URL's pathname is `/`), so it always posts to the
 * customer instance's endpoint. On one origin that would send staff
 * credentials to the customer `authorize()`, which queries `account_contacts`
 * — a silent sign-in failure, or worse a customer session for any staff member
 * whose email also exists as a contact. A server action calls this app's own
 * `signIn` binding directly and cannot target the wrong instance.
 */
export async function adminSignInAction(
  _prevState: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string } | null> {
  try {
    await signIn('credentials', {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      redirect: false,
    })
  } catch (e) {
    if (e instanceof AuthError) {
      return { error: 'Invalid email or password.' }
    }
    // Next.js redirect throws — rethrow so it takes effect
    throw e
  }

  // Honour the ?next= the proxy attaches when it bounces a deep link. Both
  // proxies have always set it and neither sign-in page ever read it, so
  // deep links were silently dropped. Relative to this app's root; a
  // non-relative or protocol-relative value is discarded by safeNextPath.
  redirect(safeNextPath(formData.get('next')) ?? '/admin')
}

/** Staff sign-out. Same reasoning as above — never `next-auth/react`. */
export async function adminSignOutAction(): Promise<void> {
  await signOut({ redirectTo: '/admin/sign-in' })
}
