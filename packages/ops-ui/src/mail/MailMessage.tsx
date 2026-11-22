import type { ReactNode } from 'react'
import AttachmentChip from './AttachmentChip'
import SandboxedBody from './SandboxedBody'
import type { MailMessageProps } from './types'

function HeaderRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="border-io-line grid grid-cols-[62px_minmax(0,1fr)] items-center gap-2 border-b px-3 py-2">
      <dt className="text-io-ink-3 text-[12px]">{label}</dt>
      <dd className="min-w-0">{children}</dd>
    </div>
  )
}

/**
 * Mail kit `km-ml`: one received message in the console. Line border, r 8, 12.5px; header rows on a 62/1fr
 * grid (From, To, Cc, Subject); the body in SandboxedBody (the only place its HTML goes); attachments below.
 * Renders from the server; SandboxedBody is the client island.
 *
 * `remoteImages` is accepted for the S05 image proxy; until then remote images are always blocked.
 */
export default function MailMessage({
  from,
  to,
  cc,
  subject,
  bodyHtml,
  attachments = [],
  nonce,
  bodyHeight = 'reading',
}: MailMessageProps) {
  return (
    <article
      data-part="mail-message"
      aria-label={subject}
      className="border-io-line rounded-io-8 bg-io-card w-full overflow-hidden border text-[12.5px]"
    >
      <dl>
        <HeaderRow label="From">
          <b className="font-medium">{from.name}</b> · {from.address}
        </HeaderRow>
        <HeaderRow label="To">{to}</HeaderRow>
        {cc ? <HeaderRow label="Cc">{cc}</HeaderRow> : null}
        <HeaderRow label="Subject">
          <b className="font-medium">{subject}</b>
        </HeaderRow>
      </dl>
      <SandboxedBody html={bodyHtml} height={bodyHeight} {...(nonce ? { nonce } : {})} />
      {attachments.length > 0 ? (
        <div className="flex flex-wrap gap-1.5 px-3.5 pb-3">
          {attachments.map((a) => (
            <AttachmentChip key={`${a.fileType}:${a.name}`} {...a} />
          ))}
        </div>
      ) : null}
    </article>
  )
}
