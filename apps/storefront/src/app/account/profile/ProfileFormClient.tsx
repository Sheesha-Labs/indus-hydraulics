'use client'

import { useActionState } from 'react'
import {
  cancelEmailChange,
  changePassword,
  requestEmailChange,
  updateProfileBasics,
  type ProfileFormState,
} from './actions'

type Initial = {
  firstName: string
  lastName: string
  email: string
  phone: string | null
  ssoProvider: string | null
  hasPassword: boolean
  lastSignInAt: string | null
  role: string
  pendingEmail: { newEmail: string; expiresAt: string } | null
}

interface Props {
  initial: Initial
}

const idleState: ProfileFormState = { status: 'idle' }

export default function ProfileFormClient({ initial }: Props) {
  const [basicsState, basicsAction, basicsPending] = useActionState(
    updateProfileBasics,
    idleState,
  )
  const [pwState, pwAction, pwPending] = useActionState(changePassword, idleState)
  const [emailState, emailAction, emailPending] = useActionState(
    requestEmailChange,
    idleState,
  )
  const [cancelState, cancelAction, cancelPending] = useActionState(
    async () => cancelEmailChange(),
    idleState,
  )

  const basicsErrors =
    basicsState.status === 'error' ? basicsState.fieldErrors ?? {} : {}
  const pwErrors = pwState.status === 'error' ? pwState.fieldErrors ?? {} : {}
  const emailErrors =
    emailState.status === 'error' ? emailState.fieldErrors ?? {} : {}

  // Pending change can be:
  //   - present from server (initial.pendingEmail) — was already requested
  //   - just-cancelled in this session — clear the local view
  const showPendingFromServer =
    initial.pendingEmail &&
    !(cancelState.status === 'success' && cancelState.section === 'email')

  const lastSignIn = initial.lastSignInAt
    ? new Date(initial.lastSignInAt).toLocaleString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Never'

  return (
    <div className="max-w-[640px]">
      <header className="mb-8">
        <h1 className="text-[28px] font-semibold tracking-tight mb-1">Profile</h1>
        <p className="text-[14px] text-[var(--color-muted)]">
          Update your name, contact details, and password.
        </p>
      </header>

      {/* ── Profile basics ─────────────────────────────────── */}
      <section className="border border-[var(--color-border)] bg-[var(--color-elevated)] p-6 mb-6">
        <h2 className="text-[16px] font-semibold mb-1">Your details</h2>
        <p className="text-[12px] text-[var(--color-muted)] mb-5">
          Used on RFQs, in email signatures we send back to you, and on your
          account page.
        </p>

        <form action={basicsAction} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="First name *"
              name="firstName"
              defaultValue={initial.firstName}
              required
              error={basicsErrors.firstName}
            />
            <Field
              label="Last name *"
              name="lastName"
              defaultValue={initial.lastName}
              required
              error={basicsErrors.lastName}
            />
          </div>
          <Field
            label="Phone / WhatsApp"
            name="phone"
            type="tel"
            defaultValue={initial.phone ?? ''}
            placeholder="+91 98XXX XXXXX"
            mono
            error={basicsErrors.phone}
          />

          {basicsState.status === 'error' && !Object.keys(basicsErrors).length && (
            <p className="text-[13px] text-[var(--color-danger)] py-1">
              {basicsState.message}
            </p>
          )}
          {basicsState.status === 'success' && basicsState.section === 'basics' && (
            <p className="text-[13px] text-[var(--color-accent)] py-1">
              Saved.
            </p>
          )}

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={basicsPending}
              className="h-10 px-5 bg-[var(--color-accent)] text-white text-[13px] font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {basicsPending ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </form>
      </section>

      {/* ── Sign-in info ───────────────────────────────────── */}
      <section className="border border-[var(--color-border)] bg-[var(--color-elevated)] p-6 mb-6">
        <h2 className="text-[16px] font-semibold mb-4">Sign-in</h2>

        <dl className="grid grid-cols-[140px_1fr] gap-y-3 text-[13px]">
          <dt className="text-[var(--color-muted)]">Email</dt>
          <dd className="font-mono">{initial.email}</dd>

          <dt className="text-[var(--color-muted)]">Sign-in method</dt>
          <dd>
            {initial.ssoProvider
              ? `Single sign-on (${initial.ssoProvider})`
              : initial.hasPassword
                ? 'Email + password'
                : 'Not configured'}
          </dd>

          <dt className="text-[var(--color-muted)]">Last sign-in</dt>
          <dd className="font-mono text-[12px]">{lastSignIn}</dd>

          <dt className="text-[var(--color-muted)]">Role</dt>
          <dd>{initial.role}</dd>
        </dl>
      </section>

      {/* ── Change email ───────────────────────────────────── */}
      {!initial.ssoProvider && (
        <section className="border border-[var(--color-border)] bg-[var(--color-elevated)] p-6 mb-6">
          <h2 className="text-[16px] font-semibold mb-1">Change sign-in email</h2>
          <p className="text-[12px] text-[var(--color-muted)] mb-5">
            We&apos;ll send a verification link to the new address. Your current
            email keeps working until you click that link.
          </p>

          {showPendingFromServer ? (
            <div className="border border-[var(--color-border-2)] bg-[var(--color-surface)] p-4 mb-3">
              <p className="text-[13px] text-[var(--color-body)] mb-1">
                Pending change to <b className="font-mono">{initial.pendingEmail!.newEmail}</b>.
              </p>
              <p className="text-[12px] text-[var(--color-muted)] mb-3">
                Verification link sent · expires {new Date(initial.pendingEmail!.expiresAt).toLocaleString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}.
              </p>
              <form action={cancelAction}>
                <button
                  type="submit"
                  disabled={cancelPending}
                  className="font-mono text-[11px] text-[var(--color-muted)] hover:text-[var(--color-danger)] disabled:opacity-50 transition-colors"
                >
                  {cancelPending ? 'Cancelling…' : 'Cancel pending change'}
                </button>
              </form>
            </div>
          ) : (
            <form action={emailAction} className="space-y-3">
              <Field
                label="New email *"
                name="newEmail"
                type="email"
                placeholder="you@company.com"
                required
                mono
                hint="The verification link goes to this address."
                error={emailErrors.newEmail}
              />

              {emailState.status === 'error' && !Object.keys(emailErrors).length && (
                <p className="text-[13px] text-[var(--color-danger)] py-1">
                  {emailState.message}
                </p>
              )}
              {emailState.status === 'success' && emailState.section === 'email' && emailState.message && (
                <p className="text-[13px] text-[var(--color-accent)] py-1">
                  {emailState.message}
                </p>
              )}
              {cancelState.status === 'success' && cancelState.section === 'email' && cancelState.message && (
                <p className="text-[13px] text-[var(--color-muted)] py-1">
                  {cancelState.message}
                </p>
              )}

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={emailPending}
                  className="h-10 px-5 bg-[var(--color-accent)] text-white text-[13px] font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
                >
                  {emailPending ? 'Sending verification…' : 'Send verification email'}
                </button>
              </div>
            </form>
          )}
        </section>
      )}

      {/* ── Password change ────────────────────────────────── */}
      {initial.hasPassword && (
        <section className="border border-[var(--color-border)] bg-[var(--color-elevated)] p-6">
          <h2 className="text-[16px] font-semibold mb-1">Change password</h2>
          <p className="text-[12px] text-[var(--color-muted)] mb-5">
            Choose a strong password — at least 10 characters, ideally a passphrase.
          </p>

          <form action={pwAction} className="space-y-3">
            <Field
              label="Current password *"
              name="currentPassword"
              type="password"
              required
              error={pwErrors.currentPassword}
            />
            <Field
              label="New password *"
              name="newPassword"
              type="password"
              required
              autoComplete="new-password"
              hint="At least 10 characters."
              error={pwErrors.newPassword}
            />
            <Field
              label="Confirm new password *"
              name="confirmPassword"
              type="password"
              required
              autoComplete="new-password"
              error={pwErrors.confirmPassword}
            />

            {pwState.status === 'error' && !Object.keys(pwErrors).length && (
              <p className="text-[13px] text-[var(--color-danger)] py-1">
                {pwState.message}
              </p>
            )}
            {pwState.status === 'success' && pwState.section === 'password' && (
              <p className="text-[13px] text-[var(--color-accent)] py-1">
                Password updated.
              </p>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={pwPending}
                className="h-10 px-5 bg-[var(--color-accent)] text-white text-[13px] font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {pwPending ? 'Saving…' : 'Update password'}
              </button>
            </div>
          </form>
        </section>
      )}

      {!initial.hasPassword && initial.ssoProvider && (
        <section className="border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] p-6">
          <p className="text-[13px] text-[var(--color-muted)] leading-[1.6]">
            You sign in via <b className="text-[var(--color-primary)]">{initial.ssoProvider}</b>.
            Password changes are managed through your identity provider.
          </p>
        </section>
      )}
    </div>
  )
}

type FieldProps = {
  label: string
  name: string
  type?: string
  defaultValue?: string
  placeholder?: string
  required?: boolean
  mono?: boolean
  hint?: string
  autoComplete?: string
  error?: string
}

function Field({
  label,
  name,
  type = 'text',
  defaultValue,
  placeholder,
  required,
  mono,
  hint,
  autoComplete,
  error,
}: FieldProps) {
  return (
    <div>
      <label className="block text-[12px] font-medium text-[var(--color-body)] mb-1.5">
        {label}
      </label>
      <input
        type={type}
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        className={`w-full h-10 px-3 border bg-[var(--color-surface)] text-[13px] text-[var(--color-primary)] placeholder:text-[var(--color-caption)] focus:outline-none focus:border-[var(--color-accent)] ${
          mono ? 'font-mono' : ''
        } ${error ? 'border-[var(--color-danger)]' : 'border-[var(--color-border)]'}`}
      />
      {hint && !error && (
        <p className="font-mono text-[11px] text-[var(--color-muted)] mt-1">{hint}</p>
      )}
      {error && (
        <p className="text-[12px] text-[var(--color-danger)] mt-1">{error}</p>
      )}
    </div>
  )
}
