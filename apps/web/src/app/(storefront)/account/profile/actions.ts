'use server'

import crypto from 'node:crypto'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { auth } from '../../../../lib/auth'
import { db } from '@indus/db'
import { hash, verify } from '../../../../lib/password'
import { renderEmailChangeVerification, sendEmail } from '@indus/email'
import { loadEmailBranding } from '../../../../lib/email-branding'

// Verification window for email-change links. 1 hour is generous enough
// for a real user to switch inboxes and click without being annoying.
const EMAIL_CHANGE_TOKEN_TTL_MINUTES = 60

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

export type ProfileSection = 'basics' | 'password' | 'email'

export type ProfileFormState =
  | { status: 'idle' }
  | { status: 'success'; section: ProfileSection; message?: string }
  | { status: 'error'; section: ProfileSection; message: string; fieldErrors?: Record<string, string> }

const initialError = (
  section: ProfileSection,
  message: string,
  fieldErrors?: Record<string, string>,
): ProfileFormState => ({ status: 'error', section, message, ...(fieldErrors ? { fieldErrors } : {}) })

const EmailChangeRequestSchema = z.object({
  newEmail: z.string().trim().toLowerCase().email('Enter a valid email').max(200),
})

function generateEmailChangeToken(): { raw: string; hash: string } {
  const raw = crypto.randomBytes(32).toString('base64url')
  const hash = crypto.createHash('sha256').update(raw).digest('hex')
  return { raw, hash }
}

function hashEmailChangeToken(rawToken: string): string {
  return crypto.createHash('sha256').update(rawToken).digest('hex')
}

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

/**
 * Start an email-change. Generates a token, stores its hash on the
 * contact, and sends a confirmation link to the *new* address. The
 * change only takes effect when that link is clicked — until then the
 * existing email keeps working.
 */
export async function requestEmailChange(
  _prev: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const session = await auth()
  if (!session?.user?.id) {
    return initialError('email', 'You are not signed in.')
  }

  const parsed = EmailChangeRequestSchema.safeParse({
    newEmail: formData.get('newEmail'),
  })

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      const key = issue.path[0]
      if (typeof key === 'string' && !fieldErrors[key]) {
        fieldErrors[key] = issue.message
      }
    }
    return initialError('email', 'Please fix the highlighted fields.', fieldErrors)
  }

  const newEmail = parsed.data.newEmail
  const contact = await db.accountContact.findUnique({
    where: { id: session.user.id },
    select: {
      email: true,
      firstName: true,
      lastName: true,
      ssoProvider: true,
    },
  })

  if (!contact) return initialError('email', 'Account not found.')

  if (contact.ssoProvider) {
    return initialError(
      'email',
      'Your account uses single sign-on. Email changes are managed through your identity provider.',
    )
  }

  if (newEmail === contact.email) {
    return initialError('email', 'This is already your sign-in email.', {
      newEmail: 'This is already your sign-in email.',
    })
  }

  // Reject if another contact already uses this email — better here than
  // letting Postgres throw a unique-constraint error after the user sees
  // the "check your inbox" message.
  const existing = await db.accountContact.findUnique({
    where: { email: newEmail },
    select: { id: true },
  })
  if (existing) {
    return initialError('email', 'That email is already in use.', {
      newEmail: 'That email is already in use.',
    })
  }

  const { raw, hash: tokenHash } = generateEmailChangeToken()
  const expiresAt = new Date(
    Date.now() + EMAIL_CHANGE_TOKEN_TTL_MINUTES * 60 * 1000,
  )

  await db.accountContact.update({
    where: { id: session.user.id },
    data: {
      pendingEmailNew: newEmail,
      pendingEmailTokenHash: tokenHash,
      pendingEmailExpiresAt: expiresAt,
    },
  })

  // Fire the confirmation email. Failures don't roll back the pending
  // state; the user can request again to get a fresh link.
  try {
    const branding = await loadEmailBranding()
    const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000').replace(
      /\/$/,
      '',
    )
    const confirmUrl = `${baseUrl}/account/email-change/confirm?token=${encodeURIComponent(raw)}`
    const customerName =
      `${contact.firstName} ${contact.lastName}`.trim() || newEmail
    const expiresOnDisplay = expiresAt.toLocaleString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

    const email = renderEmailChangeVerification({
      customerName,
      currentEmail: contact.email,
      newEmail,
      confirmUrl,
      expiresOnDisplay,
      branding: {
        legalName: branding.legalName,
        vatTrn: branding.vatTrn,
        registeredAddressLines: branding.registeredAddressLines,
        signatureName: branding.signatureName,
        signatureTitle: branding.signatureTitle,
        signaturePhone: branding.signaturePhone,
        signatureEmail: branding.signatureEmail,
      },
    })

    await sendEmail({
      kind: 'email_change_verification',
      to: [newEmail],
      subject: email.subject,
      html: email.html,
      fromEmail: branding.fromEmail,
      ...(branding.fromName ? { fromName: branding.fromName } : {}),
      ...(branding.replyTo ? { replyTo: branding.replyTo } : {}),
    })
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[requestEmailChange] failed to send verification email', err)
    return initialError(
      'email',
      'We saved your request but the verification email could not be sent. Please try again in a minute.',
    )
  }

  revalidatePath('/account/profile')
  return {
    status: 'success',
    section: 'email',
    message: `Check ${newEmail} for a confirmation link. It expires in 1 hour.`,
  }
}

/**
 * Cancel a pending email change. Clears the three pendingEmail* columns
 * so a new request starts fresh.
 */
export async function cancelEmailChange(): Promise<ProfileFormState> {
  const session = await auth()
  if (!session?.user?.id) {
    return initialError('email', 'You are not signed in.')
  }

  await db.accountContact.update({
    where: { id: session.user.id },
    data: {
      pendingEmailNew: null,
      pendingEmailTokenHash: null,
      pendingEmailExpiresAt: null,
    },
  })

  revalidatePath('/account/profile')
  return { status: 'success', section: 'email', message: 'Pending email change cancelled.' }
}

export type EmailChangeConfirmResult =
  | { ok: true; newEmail: string }
  | { ok: false; reason: 'invalid' | 'expired' | 'taken' | 'unknown' }

/**
 * Confirm an email change from the link clicked in the verification email.
 * Verifies the token (by hash), checks expiry, then swaps the email +
 * clears the pending state in a transaction.
 *
 * Called from the /account/email-change/confirm page. Does not require
 * the user to be signed in — anyone with the token can complete the
 * swap (which is fine because the token was emailed to the new address
 * by an authenticated request).
 */
export async function confirmEmailChange(
  rawToken: string,
): Promise<EmailChangeConfirmResult> {
  if (!rawToken || typeof rawToken !== 'string') {
    return { ok: false, reason: 'invalid' }
  }

  const tokenHash = hashEmailChangeToken(rawToken)

  const contact = await db.accountContact.findFirst({
    where: { pendingEmailTokenHash: tokenHash },
    select: {
      id: true,
      pendingEmailNew: true,
      pendingEmailExpiresAt: true,
    },
  })

  if (!contact?.pendingEmailNew || !contact.pendingEmailExpiresAt) {
    return { ok: false, reason: 'invalid' }
  }

  if (contact.pendingEmailExpiresAt.getTime() < Date.now()) {
    // Expired — clear the pending state so the user starts fresh.
    await db.accountContact.update({
      where: { id: contact.id },
      data: {
        pendingEmailNew: null,
        pendingEmailTokenHash: null,
        pendingEmailExpiresAt: null,
      },
    })
    return { ok: false, reason: 'expired' }
  }

  // Race: someone else may have claimed this email between request and
  // confirm. Catch the unique-constraint violation cleanly.
  try {
    await db.accountContact.update({
      where: { id: contact.id },
      data: {
        email: contact.pendingEmailNew,
        pendingEmailNew: null,
        pendingEmailTokenHash: null,
        pendingEmailExpiresAt: null,
      },
    })
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[confirmEmailChange] update failed', err)
    return {
      ok: false,
      reason:
        err && typeof err === 'object' && 'code' in err && err.code === 'P2002'
          ? 'taken'
          : 'unknown',
    }
  }

  return { ok: true, newEmail: contact.pendingEmailNew }
}
