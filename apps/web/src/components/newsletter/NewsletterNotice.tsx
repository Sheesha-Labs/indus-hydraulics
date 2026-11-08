import Link from 'next/link'

type Props = {
  eyebrow?: string
  title: string
  children?: React.ReactNode
  /** Rendered under the copy — the page's one action, if it has one. */
  action?: React.ReactNode
}

/**
 * The frame for the newsletter's confirm and unsubscribe pages: an eyebrow,
 * a heading, a short paragraph, at most one action, and a way back.
 */
export default function NewsletterNotice({ eyebrow = 'Newsletter', title, children, action }: Props) {
  return (
    <section className="mx-auto max-w-[640px] px-4 py-20 pb-28 text-center sm:px-8">
      <p className="font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted">{eyebrow}</p>
      <h1 className="mt-4 font-serif text-[40px] font-normal leading-[1.1] tracking-[-0.02em] text-ih-ink">{title}</h1>
      {children ? <div className="mt-5 text-[15px] leading-[1.6] text-ih-ink-2">{children}</div> : null}
      {action ? <div className="mt-8 flex justify-center">{action}</div> : null}
      <div className="mt-10">
        <Link href="/" className="font-mono text-[12px] text-ih-accent hover:underline">
          ← Back to indushydraulics.com
        </Link>
      </div>
    </section>
  )
}
