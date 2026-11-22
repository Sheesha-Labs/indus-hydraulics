import { ButtonLink } from '@indus/ops-ui/controls'
import { EmptyState } from '@indus/ops-ui/states'
import { to } from '../../lib/routes'

/**
 * not-found.tsx for console segments that are not a record (05 §6.4): what the (console) boundary shows,
 * closer to the page so the section's layout (settings sub-nav, mail folders) stays on screen.
 */
export default function NotFoundState() {
  return (
    <div data-boundary="not-found" className="px-io-page-x py-6">
      <EmptyState
        mark="?"
        title="We can’t find that"
        text="The link may be old, or the record moved or was never imported. Search finds it by any reference."
        actions={
          <>
            <ButtonLink href={to('/today')} variant="primary" size="sm">
              Go to Today
            </ButtonLink>
            <ButtonLink href={to('/search')} size="sm">
              Search
            </ButtonLink>
          </>
        }
      />
    </div>
  )
}

/** The record kinds that have a "not imported" state. */
export type ImportedKind =
  'enquiry' | 'order' | 'quotation' | 'supplier' | 'client' | 'part' | 'thread' | 'invoice'

const NOUN: Readonly<Record<ImportedKind, string>> = {
  enquiry: 'enquiry',
  order: 'order',
  quotation: 'quotation',
  supplier: 'supplier',
  client: 'client',
  part: 'part',
  thread: 'mail thread',
  invoice: 'invoice',
}

/**
 * Board 211 "Reference not found" (05 §6.4): a record segment's not-found. A reference in one of our
 * formats that has no row is most often history that was never imported, so the state offers history
 * import and mail search. A malformed reference lands here too (the boundary is not told which).
 */
export function RecordNotImported({ kind }: { kind: ImportedKind }) {
  const noun = NOUN[kind]
  return (
    <div data-boundary="not-found" data-not-imported={kind} className="px-io-page-x py-6">
      <EmptyState
        mark="?"
        title={`That ${noun} is not in Operations`}
        text={`The reference may be mistyped, or the ${noun} is in your history and was never imported. Search history import or mail to find it.`}
        actions={
          <>
            <ButtonLink href={to('/history-import')} variant="primary" size="sm">
              Search history import
            </ButtonLink>
            <ButtonLink href={to('/mail/all')} size="sm">
              Search mail
            </ButtonLink>
          </>
        }
      />
    </div>
  )
}

/**
 * not-found.tsx outside the console shell. `client`: a document link that does not resolve (website look,
 * and it says nothing about why: an expired, replaced or withdrawn link is a state the page renders, 231).
 * `setup`: first-run setup with an unknown step. `card`: inside the sign-in card (an invite or reset link).
 */
export function StandaloneNotFound({ kind }: { kind: 'client' | 'setup' | 'card' }) {
  if (kind === 'card')
    return (
      <div data-boundary="not-found">
        <EmptyState
          bare
          mark="?"
          title="This link does not work"
          text="It may be mistyped or already used. Ask for a new one, or sign in."
          actions={
            <ButtonLink href={to('/sign-in')} variant="primary" size="sm">
              Go to sign-in
            </ButtonLink>
          }
        />
      </div>
    )
  return (
    <main
      id="content"
      data-boundary="not-found"
      className="bg-io-card flex min-h-screen w-full items-start justify-center px-4 py-16"
    >
      {kind === 'client' ? (
        <EmptyState
          mark="?"
          title="This link does not work"
          text="Check that the whole link was copied, or ask the person who sent it for a new one."
        />
      ) : (
        <EmptyState
          mark="?"
          title="We can’t find that step"
          text="Setup has six steps; this link names none of them."
          actions={
            <ButtonLink href={to('/setup/company')} variant="primary" size="sm">
              Back to setup
            </ButtonLink>
          }
        />
      )}
    </main>
  )
}
