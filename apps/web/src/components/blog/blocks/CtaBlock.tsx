import Link from 'next/link'
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
 * The quote link is the page's one primary action; WhatsApp and email are
 * on-navy outlines beside it. The WhatsApp and mail hrefs arrive prefilled
 * with the article title from the page. Focus outlines on the navy go steel —
 * the global accent outline is ~2:1 on navy, and the `!` is needed because the
 * global :focus-visible rule is unlayered.
 */
export default function CtaBlockView({ block, contact }: { block: CtaBlock; contact: ArticleContact }) {
  return (
    <section
      aria-label={block.heading}
      className="rounded-lg bg-ih-navy px-[22px] py-7 min-[761px]:rounded-xl min-[761px]:px-12 min-[761px]:py-11"
    >
      <h2 className="font-serif text-[28px] font-normal leading-[1.08] tracking-[-0.01em] text-white min-[761px]:text-[40px]">
        {block.heading}
      </h2>
      <p className="mt-3 max-w-[620px] text-[15.5px] leading-[1.65] text-ih-on-navy">{block.body}</p>
      <div className="mt-6 flex flex-col gap-2.5 min-[761px]:flex-row min-[761px]:flex-wrap">
        <Button asChild kind="primary" size="lg" className="focus-visible:outline-ih-steel!">
          <Link href={block.quoteUrl ?? '/quote'}>
            {block.quoteLabel ?? 'Request a quote'}
            <ArrowRightIcon />
          </Link>
        </Button>
        {contact.whatsappUrl && (
          <Button asChild kind="onnavy" size="lg" className="focus-visible:outline-ih-steel!">
            <a href={contact.whatsappUrl} target="_blank" rel="noopener">
              <WhatsAppIcon />
              WhatsApp us
            </a>
          </Button>
        )}
        <Button asChild kind="onnavy" size="lg" className="focus-visible:outline-ih-steel!">
          <a href={contact.emailUrl}>
            <MailIcon />
            Email
          </a>
        </Button>
      </div>
      {contact.phone && (
        <p className="mt-4 text-[13px] text-ih-on-navy-fine">
          Plant-down?{' '}
          <a
            href={`tel:${contact.phone.replace(/\s/g, '')}`}
            className="font-medium text-white underline underline-offset-[3px] focus-visible:outline-ih-steel!"
          >
            Call {contact.phone}
          </a>{' '}
          — 24/7
        </p>
      )}
    </section>
  )
}
