import { CredentialsSignin } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'

/**
 * The `ops-password` Credentials provider (ADR-05). It never sees a password: the password step ran
 * in a server action and left a sealed pending-2FA value. `authorize` gets that value plus a TOTP
 * code or a backup code, and signs in only when the second factor verifies.
 *
 * A failure throws SecondFactorError, whose `code` (one of a few fixed words, never a hint about the
 * account) reaches the server action that called signIn(), which turns it into the page state.
 */
export type SecondFactorCode = 'expired' | 'wrong_code' | 'locked' | 'rate_limited'

export class SecondFactorError extends CredentialsSignin {
  constructor(
    code: SecondFactorCode,
    /** Minutes left on a lock, for the board's "Try again in N minutes". */
    readonly minutes?: number
  ) {
    super()
    this.code = code
  }
}

export type PasswordCredentials = {
  pending: string
  code?: string | undefined
  backupCode?: string | undefined
}

export type AuthorizePassword = (
  credentials: PasswordCredentials
) => Promise<{ id: string; email: string; name: string }>

const str = (v: unknown) => (typeof v === 'string' && v.length <= 4096 ? v : undefined)

export function passwordProvider(authorize: AuthorizePassword) {
  return Credentials({
    id: 'ops-password',
    name: 'Password and authenticator code',
    credentials: {
      pending: { type: 'text' },
      code: { type: 'text' },
      backupCode: { type: 'text' },
    },
    async authorize(credentials) {
      const pending = str(credentials?.pending)
      if (!pending) throw new SecondFactorError('expired')
      return authorize({
        pending,
        code: str(credentials?.code),
        backupCode: str(credentials?.backupCode),
      })
    },
  })
}
