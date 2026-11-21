import AttachmentChip from './AttachmentChip'
import type { RenderedEmailProps } from './types'

/**
 * Mail kit `km-em`: an outbound email as the recipient's mail client shows it (Gmail-like). The ONE part in
 * Ops with a non-Geist face: the family is --io-mail-font (Arial) and the greys are the --io-mail-* tokens, so
 * the preview reads as an email, not as the console. ops-no-mono.test.ts exempts this file, and only this
 * file, for --io-mail-font. White, r 6, the e-mail shadow, 13/1.5; subject 17; signature under a rule.
 * Renders from the server; the body is our own React content, never received HTML.
 */
export default function RenderedEmail({
  subject,
  from,
  to,
  cc,
  time,
  body,
  attachments = [],
  signature,
}: RenderedEmailProps) {
  return (
    <article
      data-part="rendered-email"
      aria-label={`Email preview: ${subject}`}
      className="rounded-io-ctl bg-io-card shadow-io-e-mail text-io-mail-ink w-full font-[family-name:var(--io-mail-font)] text-[13px] leading-[1.5] tracking-normal"
    >
      <header className="border-io-mail-rule text-io-mail-meta flex flex-col gap-[3px] border-b px-[22px] pt-[18px] pb-3.5 text-[12px]">
        <span className="text-io-mail-ink mb-1.5 text-[17px]">{subject}</span>
        <span>
          <b className="text-io-mail-ink font-semibold">{from.name}</b> &lt;{from.address}&gt;
        </span>
        <span>
          to {to}
          {cc ? ` · cc ${cc}` : ''} · {time}
        </span>
      </header>
      <div className="flex flex-col gap-3 px-[22px] py-[18px] [&_p]:m-0">
        {body}
        {attachments.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {attachments.map((a) => (
              <AttachmentChip key={`${a.fileType}:${a.name}`} {...a} />
            ))}
          </div>
        ) : null}
        {signature ? (
          <div className="border-io-mail-rule text-io-mail-meta border-t pt-2.5 text-[12px] leading-[1.55]">
            {signature}
          </div>
        ) : null}
      </div>
    </article>
  )
}
