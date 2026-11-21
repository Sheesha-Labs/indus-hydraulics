import { Button } from '@indus/ui'
import type { CtaBlock } from '@indus/domain'
import { ArrowRightIcon, MailIcon, WhatsAppIcon } from '../../designed/icons'

/** Prebuilt contact hrefs, resolved once per page from StoreSettings. */
export type ArticleContact = {
  whatsappUrl: string | null
  emailUrl: string
  phone: string | null
}

/**
 * The enquiry panel every article ends on — an article that ranks and offers
 * no route to an RFQ is a cost, not an asset, which is why this is a block type
 * rather than something an author remembers to add.
 *
 * The email enquiry (to sales@, purchase@ in CC) is the page's one primary
 * action; WhatsApp is an on-navy outline beside it. The block's stored
 * `quoteUrl` pointed at the quote cart, retired in 2026-11, and is ignored.
 * The WhatsApp and mail hrefs arrive prefilled with the article title. Focus outlines on the navy go steel —
 * the global accent outline is ~2:1 on navy, and the `!` is needed because the
 * global :focus-visible rule is unlayered.
 */
export default function CtaBlockView({
  block,
  contact,
}: {
  block: CtaBlock
  contact: ArticleContact
}) {
  return (
    <section
      aria-label={block.heading}
      className="bg-ih-navy rounded-lg px-[22px] py-7 min-[761px]:rounded-xl min-[761px]:px-12 min-[761px]:py-11"
    >
      <h2 className="font-serif text-[28px] leading-[1.08] font-normal tracking-[-0.01em] text-white min-[761px]:text-[40px]">
        {block.heading}
      </h2>
      <p className="text-ih-on-navy mt-3 max-w-[620px] text-[15.5px] leading-[1.65]">
        {block.body}
      </p>
      <div className="mt-6 flex flex-col gap-2.5 min-[761px]:flex-row min-[761px]:flex-wrap">
        <Button asChild kind="primary" size="lg" className="focus-visible:outline-ih-steel!">
          <a href={contact.emailUrl}>
            <MailIcon />
            Email an enquiry
            <ArrowRightIcon />
          </a>
        </Button>
        {contact.whatsappUrl && (
          <Button asChild kind="onnavy" size="lg" className="focus-visible:outline-ih-steel!">
            <a href={contact.whatsappUrl} target="_blank" rel="noopener">
              <WhatsAppIcon />
              WhatsApp us
            </a>
          </Button>
        )}
      </div>
      {contact.phone && (
        <p className="text-ih-on-navy-fine mt-4 text-[13px]">
          Plant-down?{' '}
          <a
            href={`tel:${contact.phone.replace(/\s/g, '')}`}
            className="focus-visible:outline-ih-steel! font-medium text-white underline underline-offset-[3px]"
          >
            Call {contact.phone}
          </a>{' '}
          — 24/7
        </p>
      )}
    </section>
  )
}
