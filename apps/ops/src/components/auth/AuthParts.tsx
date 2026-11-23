import { Button } from '@indus/ops-ui/controls'
import { cn } from '@indus/ops-ui/lib/cn'
import { LogoPlaceholder } from '@indus/ops-ui/shell'
import { Banner } from '@indus/ops-ui/status'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { signInWithGoogle } from '../../app/(auth)/sign-in/actions'
import type { AuthNotice } from './states'

/**
 * The pieces every board-77 card is built from, inside the (auth) layout's T11 card. Server parts;
 * the forms that need state (PasswordForm, TwoFactorForm, ResetForm, SetupForm) are client parts.
 */

/** Logo, the serif title and an optional subtitle (board: logo 34, title 40 on the main card). */
export function AuthTitle({
  title,
  subtitle,
  main = false,
  logo = main,
  lead,
}: {
  title: string
  subtitle?: string | undefined
  /** The main /sign-in card: logo and the 40px section title. Other cards: 30px record title. */
  main?: boolean
  logo?: boolean
  /** One line under the title ("From your authenticator app"). */
  lead?: string
}) {
  return (
    <div className="flex flex-col items-center gap-1.5 text-center">
      {logo ? (
        <span data-logo className="mb-1 flex h-[34px] items-center">
          <LogoPlaceholder />
        </span>
      ) : null}
      <h1 className={cn('io-display leading-none', main ? 'text-io-section' : 'text-io-record')}>
        {title}
      </h1>
      {subtitle ? <p className="text-io-ink-3 text-[12.5px]">{subtitle}</p> : null}
      {lead ? <p className="text-io-ink-2 text-[12.5px] leading-[1.45]">{lead}</p> : null}
    </div>
  )
}

/** The Google "G" ring as the board draws it: four quarter arcs, token colours. */
export function GoogleMark() {
  const r = 6.5
  const c = 2 * Math.PI * r
  const q = c / 4
  const arcs = ['--io-google-blue', '--io-google-green', '--io-google-yellow', '--io-google-red']
  return (
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 18 18" className="flex-none">
      {arcs.map((token, i) => (
        <circle
          key={token}
          cx="9"
          cy="9"
          r={r}
          fill="none"
          stroke={`var(${token})`}
          strokeWidth="5"
          strokeDasharray={`${q} ${c - q}`}
          strokeDashoffset={-q * i}
          transform="rotate(-90 9 9)"
        />
      ))}
    </svg>
  )
}

/**
 * Continue with Google (or "Use another account" after a Google refusal: the provider always asks
 * with prompt=select_account, so the same action re-opens the account picker).
 */
export function GoogleButton({
  next,
  label = 'Continue with Google',
  primary = false,
}: {
  next?: string | undefined
  label?: string
  primary?: boolean
}) {
  return (
    <form action={signInWithGoogle} className="flex flex-col">
      <input type="hidden" name="next" value={next ?? ''} />
      <Button
        type="submit"
        size="lg"
        variant={primary ? 'primary' : 'secondary'}
        className="w-full gap-2.5 text-[14px]"
      >
        {primary ? (
          <span className="bg-io-card rounded-io-pill flex p-[2px]">
            <GoogleMark />
          </span>
        ) : (
          <GoogleMark />
        )}
        {label}
      </Button>
    </form>
  )
}

export function OrRule({ children = 'or' }: { children?: ReactNode }) {
  return (
    <div className="text-io-ink-3 flex items-center gap-2.5 text-[12px]">
      <span aria-hidden="true" className="bg-io-line h-px flex-1" />
      {children}
      <span aria-hidden="true" className="bg-io-line h-px flex-1" />
    </div>
  )
}

export function Notice({ notice }: { notice: AuthNotice | null }) {
  if (!notice) return null
  return (
    <div className="flex flex-col gap-3">
      <Banner tone={notice.tone} className="px-3 py-2.5 text-[12.5px]">
        {notice.text}
      </Banner>
      {notice.resetLink ? <TextLink href="/sign-in/forgot">Reset password</TextLink> : null}
    </div>
  )
}

/** The board's centred accent links ("Forgot password", "Reset password", "Use a backup code"). */
export function TextLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href as '/sign-in/forgot'}
      className="io-focus rounded-io-tag text-io-accent hover:text-io-accent-hover self-center text-[12.5px]"
    >
      {children}
    </Link>
  )
}

/** The note under the card's content: "Only @domain accounts". */
export function AuthFoot({ children }: { children: ReactNode }) {
  return <p className="text-io-ink-3 text-center text-[12px] leading-[1.5]">{children}</p>
}
