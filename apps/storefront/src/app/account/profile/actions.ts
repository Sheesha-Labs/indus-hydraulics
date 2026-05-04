'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { auth } from '../../../lib/auth'
import { db } from '@indus/db'
import { hash, verify } from '../../../lib/password'

const ProfileBasicsSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required').max(100),
  lastName: z.string().trim().min(1, 'Last name is required').max(100),
  phone: z
    .string()
    .trim()
    .max(32, 'Phone number is too long')
    .optional()
    .or(z.literal('')),
})

const PasswordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(10, 'New password must be at least 10 characters'),
    confirmPassword: z.string().min(1, 'Please confirm the new password'),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    path: ['confirmPassword'],
    message: 'New passwords do not match',
  })
  .refine((d) => d.currentPassword !== d.newPassword, {
    path: ['newPassword'],
    message: 'New password must be different from the current one',
  })

export type ProfileFormState =
  | { status: 'idle' }
  | { status: 'success'; section: 'basics' | 'password' }
  | { status: 'error'; section: 'basics' | 'password'; message: string; fieldErrors?: Record<string, string> }

const initialError = (
  section: 'basics' | 'password',
  message: string,
  fieldErrors?: Record<string, string>,
): ProfileFormState => ({ status: 'error', section, message, ...(fieldErrors ? { fieldErrors } : {}) })

export async function updateProfileBasics(
  _prev: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const session = await auth()
  if (!session?.user?.id) {
    return initialError('basics', 'You are not signed in.')
  }

  const parsed = ProfileBasicsSchema.safeParse({
    firstName: formData.get('firstName'),
    lastName: formData.get('lastName'),
    phone: formData.get('phone') ?? '',
  })

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      const key = issue.path[0]
      if (typeof key === 'string' && !fieldErrors[key]) {
        fieldErrors[key] = issue.message
      }
    }
    return initialError('basics', 'Please fix the highlighted fields.', fieldErrors)
  }

  await db.accountContact.update({
    where: { id: session.user.id },
    data: {
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      phone: parsed.data.phone ? parsed.data.phone : null,
    },
  })

  revalidatePath('/account/profile')
  // Layout fetches the user name into the sidebar, refresh it too.
  revalidatePath('/account', 'layout')

  return { status: 'success', section: 'basics' }
}

export async function changePassword(
  _prev: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const session = await auth()
  if (!session?.user?.id) {
    return initialError('password', 'You are not signed in.')
  }

  const parsed = PasswordChangeSchema.safeParse({
    currentPassword: formData.get('currentPassword'),
    newPassword: formData.get('newPassword'),
    confirmPassword: formData.get('confirmPassword'),
  })

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      const key = issue.path[0]
      if (typeof key === 'string' && !fieldErrors[key]) {
        fieldErrors[key] = issue.message
      }
    }
    return initialError('password', 'Please fix the highlighted fields.', fieldErrors)
  }

  const contact = await db.accountContact.findUnique({
    where: { id: session.user.id },
    select: { passwordHash: true },
  })

  if (!contact?.passwordHash) {
    return initialError(
      'password',
      'Your account uses single sign-on. Password changes are managed through your identity provider.',
    )
  }

  const ok = await verify(parsed.data.currentPassword, contact.passwordHash)
  if (!ok) {
    return initialError('password', 'Current password is incorrect.', {
      currentPassword: 'Current password is incorrect.',
    })
  }

  const newHash = await hash(parsed.data.newPassword)
  await db.accountContact.update({
    where: { id: session.user.id },
    data: { passwordHash: newHash },
  })

  return { status: 'success', section: 'password' }
}
