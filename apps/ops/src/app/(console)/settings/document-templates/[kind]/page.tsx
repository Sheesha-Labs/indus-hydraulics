import {
  audienceOf,
  KIND_LABEL,
  KIND_SEQUENCE,
  TEMPLATE_KINDS,
  type DocKind,
} from '@indus/ops-core'
import { nextNumberFor } from '../../../../../server/numbering/sequences'
import { previewTerms } from '../../../../../server/terms/presets'
import { notFound } from 'next/navigation'
import { requireOpsUser } from '../../../../../lib/access'
import { signInFor } from '../../../../../lib/page-access'
import { loadLetterhead } from '../../../../../server/documents/assets'
import { mailboxRoleFor } from '../../../../../server/documents/kinds'
import { getTemplateEditor } from '../../../../../server/documents/templates'
import TemplateEditor from './TemplateEditor'

const DATE = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  timeZone: 'Asia/Dubai',
})

const OPEN_NOUN: Record<DocKind, string> = {
  quotation: 'open quotation',
  oa: 'open acknowledgement',
  pi: 'open proforma',
  invoice: 'open invoice',
  cn: 'open credit note',
  rfq: 'open RFQ',
  po: 'open PO',
  pl: 'open packing list',
  dn: 'open delivery note',
}

/**
 * Settings › Document templates › <kind> (board 57, S11-T05): the editor for one document's template, with
 * the live layout preview. Everyone signed in may look; only the Owner saves and publishes (the actions check
 * the role again).
 */
export default async function DocumentTemplatePage({
  params,
}: {
  params: Promise<{ kind: string }>
}) {
  const { kind } = await params
  const user = await requireOpsUser().catch(signInFor(`/settings/document-templates/${kind}`))
  if (!(TEMPLATE_KINDS as readonly string[]).includes(kind)) notFound()
  const k = kind as DocKind
  const [e, { letterhead }, terms, nextNumber] = await Promise.all([
    getTemplateEditor(k),
    loadLetterhead({ role: mailboxRoleFor(k) }),
    audienceOf(k) === 'client' ? previewTerms() : Promise.resolve(null),
    nextNumberFor(KIND_SEQUENCE[k]),
  ])
  const pub = e.published
  const n = e.usedOnOpen
  const versionLine = [
    `Version ${pub.version}`,
    pub.publishedAt
      ? `published ${DATE.format(pub.publishedAt)}${pub.publishedByName ? ` by ${pub.publishedByName}` : ''}`
      : 'the seeded default',
    `used on ${n} ${OPEN_NOUN[k]}${n === 1 ? '' : 's'}`,
  ].join(' · ')
  return (
    <TemplateEditor
      key={`${pub.id}:${e.stamp}`}
      kind={k}
      title={KIND_LABEL[k]}
      versionLine={versionLine}
      published={pub.definition}
      draft={e.draft?.definition ?? null}
      draftVersion={e.draft?.version ?? null}
      stamp={e.stamp}
      isOwner={user.role === 'owner'}
      awaitingSignoff={pub.signoffStatus === 'awaiting'}
      letterhead={letterhead}
      signer={{ name: user.name, role: user.role === 'owner' ? 'Owner' : 'Helper' }}
      terms={terms}
      previewLabel={nextNumber ?? 'Next free number'}
    />
  )
}
