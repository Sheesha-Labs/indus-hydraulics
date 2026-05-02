'use server'

import { z } from 'zod'
import { signIn } from '../lib/auth'
import { AuthError } from 'next-auth'
import { redirect } from 'next/navigation'

type Result<T> = { success: true; data: T } | { success: false; error: string }

// ── Sign In ───────────────────────────────────────────────────────────────────

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  rememberMe: z.boolean().optional(),
  locale: z.string().default('en'),
})

export async function signInAction(formData: FormData): Promise<Result<void>> {
  const raw = {
    email: formData.get('email'),
    password: formData.get('password'),
    rememberMe: formData.get('rememberMe') === 'on',
  }

  const parsed = signInSchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, error: 'Invalid email or password.' }
  }

  try {
    await signIn('credentials', {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    })
  } catch (err) {
    if (err instanceof AuthError) {
      switch (err.type) {
        case 'CredentialsSignin':
          return { success: false, error: 'Invalid email or password.' }
        default:
          return { success: false, error: 'Something went wrong. Please try again.' }
      }
    }
    throw err
  }

  redirect(`/${parsed.data.locale}/account`)
}

// ── Sign Up ───────────────────────────────────────────────────────────────────

const signUpSchema = z.object({
  fullName: z.string().min(2),
  jobTitle: z.string().optional(),
  email: z.string().email(),
  phone: z.string().min(7),
  password: z.string().min(10),
  companyName: z.string().min(2),
  industry: z.string().min(1),
  annualSpend: z.string().optional(),
  taxId: z.string().optional(),
  country: z.string().min(2),
  needs: z.array(z.string()).optional(),
  agreedToTerms: z.boolean(),
  locale: z.string().default('en'),
})

export async function signUpAction(formData: FormData): Promise<Result<{ message: string }>> {
  const needs = formData.getAll('needs').map(String)

  const raw = {
    fullName: formData.get('fullName'),
    jobTitle: formData.get('jobTitle') ?? undefined,
    email: formData.get('email'),
    phone: formData.get('phone'),
    password: formData.get('password'),
    companyName: formData.get('companyName'),
    industry: formData.get('industry'),
    annualSpend: formData.get('annualSpend') ?? undefined,
    taxId: formData.get('taxId') ?? undefined,
    country: formData.get('country'),
    needs: needs.length ? needs : undefined,
    agreedToTerms: formData.get('agreedToTerms') === 'on',
  }

  const parsed = signUpSchema.safeParse(raw)
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]
    return { success: false, error: firstError?.message ?? 'Invalid form data.' }
  }

  if (!parsed.data.agreedToTerms) {
    return { success: false, error: 'You must agree to the terms and privacy policy.' }
  }

  const { db } = await import('@indus/db')
  const { hash } = await import('../lib/password')

  const existing = await db.accountContact.findUnique({ where: { email: parsed.data.email } })
  if (existing) {
    return { success: false, error: 'An account with this email already exists.' }
  }

  const passwordHash = await hash(parsed.data.password)

  const nameParts = parsed.data.fullName.trim().split(' ')
  const firstName = nameParts[0] ?? parsed.data.fullName
  const lastName = nameParts.slice(1).join(' ') || ''

  const code = `ACC-${Date.now().toString().slice(-6)}`

  await db.$transaction(async (tx) => {
    const account = await tx.account.create({
      data: {
        code,
        legalName: parsed.data.companyName,
        displayName: parsed.data.companyName,
        region: parsed.data.country,
        taxId: parsed.data.taxId ?? null,
        tier: 'bronze',
        status: 'active',
        creditLimit: 0,
        paymentTermsDays: 30,
      },
    })

    await tx.accountContact.create({
      data: {
        accountId: account.id,
        email: parsed.data.email,
        firstName,
        lastName,
        phone: parsed.data.phone,
        passwordHash,
        role: 'procurement',
        isActive: true,
      },
    })
  })

  return { success: true, data: { message: 'Account created successfully. You can now sign in.' } }
}

// ── Forgot Password ───────────────────────────────────────────────────────────

const forgotPasswordSchema = z.object({
  email: z.string().email(),
})

export async function forgotPasswordAction(formData: FormData): Promise<Result<{ email: string }>> {
  const raw = { email: formData.get('email') }
  const parsed = forgotPasswordSchema.safeParse(raw)

  if (!parsed.success) {
    return { success: false, error: 'Please enter a valid email address.' }
  }

  const { db } = await import('@indus/db')

  // Always return success — never reveal whether email exists
  const contact = await db.accountContact.findUnique({ where: { email: parsed.data.email } })

  if (contact?.isActive) {
    const { hash } = await import('../lib/password')
    const crypto = await import('crypto')
    const rawToken = crypto.randomBytes(32).toString('hex')
    const tokenHash = await hash(rawToken)
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 60 min

    await db.passwordResetToken.create({
      data: {
        contactId: contact.id,
        tokenHash,
        expiresAt,
        usedAt: null,
      },
    })

    // TODO: send email via Resend with reset link containing rawToken
  }

  return { success: true, data: { email: parsed.data.email } }
}
