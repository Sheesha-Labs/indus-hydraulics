import { LeadCapturePanel } from '@indus/ui'
import type { CtaBlock } from '@indus/domain'

/** Prebuilt contact hrefs, resolved once per page from StoreSettings. */
export type ArticleContact = {
  whatsappUrl: string | null
  emailUrl: string
  phone: string | null
}

/**
 * Wraps the shared LeadCapturePanel so every article terminates in a quote
 * path. An article that ranks and offers no route to an RFQ is a cost, not an
 * asset — which is why this is a block type rather than something an author
 * remembers to add.
 *
 * `compact` rather than `wide`: this sits inline in a 780px article column,
 * not as a full-bleed band at the foot of a landing page.
 */
export default function CtaBlockView({
  block,
  contact,
}: {
  block: CtaBlock
  contact: ArticleContact
}) {
  return (
    <div className="my-8">
      <LeadCapturePanel
        heading={block.heading}
        body={block.body}
        quoteUrl={block.quoteUrl ?? '/quote'}
        quoteLabel={block.quoteLabel ?? undefined}
        whatsappUrl={contact.whatsappUrl}
        emailUrl={contact.emailUrl}
        phone={contact.phone}
        variant="compact"
      />
    </div>
  )
}
